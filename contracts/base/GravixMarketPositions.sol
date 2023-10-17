// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./GravixStorage.sol";

import "../libraries/GravixMath.sol";
import "../libraries/Constants.sol";
import "../libraries/Errors.sol";
import "./GravixMarkets.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

abstract contract GravixMarketPositions is GravixMarkets {
    function openMarketPosition(
        uint marketIdx,
        IGravix.PositionType positionType,
        uint collateral, // 6 decimals number
        uint expectedPrice, // 8 decimals number
        uint leverage, // 6 decimals number
        uint maxSlippageRate, // %
        uint _assetPrice,
        uint timestamp,
        bytes calldata  signature
    ) public checkSign(_assetPrice, timestamp, marketIdx, signature) {

        IGravix.Market storage market = markets[marketIdx];
        require(!market.paused, "Market closed");

        IERC20(usdt).transferFrom(msg.sender, address(this), collateral);

        uint positionSizeAsset = calculatePositionAssetSize(collateral, leverage, _assetPrice);
        uint dynamicSpread = getDynamicSpread(positionSizeAsset, market, positionType);
        Funding memory _funding = _updateFunding(marketIdx, _assetPrice);
        uint16 _error = _addPositionToMarketOrReturnErr(marketIdx, positionSizeAsset, _assetPrice, positionType);
        require(_error == 0, "Add position to market error");

        uint openPrice = GravixMath.applyOpenSpread(
            _assetPrice,
            positionType,
            market.fees.baseSpreadRate + dynamicSpread
        );
        int256 funding = positionType == PositionType.Long ? _funding.accLongUSDFundingPerShare : _funding.accShortUSDFundingPerShare;

        uint leveragedPositionUsd = Math.mulDiv(collateral, leverage, Constants.LEVERAGE_BASE);
        uint openFee = Math.mulDiv(leveragedPositionUsd, market.fees.openFeeRate, Constants.HUNDRED_PERCENT);

        uint allowedDelta = Math.mulDiv(expectedPrice, maxSlippageRate, Constants.HUNDRED_PERCENT);
        uint minPrice = expectedPrice - allowedDelta;
        uint maxPrice = expectedPrice + allowedDelta;

        bool tooHighSlippage = openPrice < minPrice || openPrice > maxPrice;

        require(!tooHighSlippage, "Slippage is too high");

        IGravix.Position memory newPosition = IGravix.Position({
            marketIdx: marketIdx,
            positionType: positionType,
            initialCollateral: collateral,
            openFee: openFee,
            openPrice: openPrice,
            markPrice: _assetPrice,
            leverage: leverage,
            accUSDFundingPerShare: funding,
            borrowBaseRatePerHour: market.fees.borrowBaseRatePerHour,
            baseSpreadRate: market.fees.baseSpreadRate,
            closeFeeRate: market.fees.closeFeeRate,
            liquidationThresholdRate: liquidationParams.thresholdRate,
            createdAt: block.timestamp
        });

        _collectOpenFee(newPosition.openFee);
        collateralReserve += newPosition.initialCollateral - newPosition.openFee;

        positions[msg.sender][requestNonce] = newPosition;
        emit MarketOrderExecution(
            msg.sender,
            newPosition,
            requestNonce
        );
        requestNonce += 1;

    }

    function closeMarketPosition(
        uint marketIdx,
        uint positionKey,
        uint _assetPrice,
        uint timestamp,
        bytes calldata  signature
    ) public checkSign(_assetPrice, timestamp, marketIdx, signature) {
        IGravix.Market storage market = markets[marketIdx];
        require(!market.paused, "Market closed");
        require(positions[msg.sender][positionKey].initialCollateral > 0, "Position not found");
        require(positions[msg.sender][positionKey].marketIdx == marketIdx, "Position doesn't match marketIdx");

        Funding memory _funding = _updateFunding(marketIdx, _assetPrice);
        PositionView memory _positionView = getPositionView(ViewInput({
            funding: _funding,
            assetPrice: _assetPrice,
            user: msg.sender,
            positionKey: positionKey
        }));
        delete positions[msg.sender][positionKey];

        uint collateral = _positionView.position.initialCollateral - _positionView.position.openFee;
        collateralReserve -= collateral;
        uint initialPositionSizeAsset = calculatePositionAssetSize(collateral, _positionView.position.leverage, _positionView.position.openPrice);
        _removePositionFromMarket(
            _positionView.position.marketIdx,
            initialPositionSizeAsset,
            _assetPrice,
            _positionView.position.positionType
        );

        if (_positionView.liquidate) {
            _increaseInsuranceFund(collateral);

            emit LiquidatePosition(msg.sender, msg.sender, positionKey, _positionView);
            return;
        } else {
            int pnlLimit = int(Math.mulDiv(collateral, maxPnlRate, Constants.HUNDRED_PERCENT));
            int limitedPnl = GravixMath.min(_positionView.pnl, pnlLimit);

            int pnlWithFees = limitedPnl - int(_positionView.borrowFee) - _positionView.fundingFee;

            _collectCloseFee(_positionView.closeFee);

            uint debt;

            if (pnlWithFees < 0) {
                _increaseInsuranceFund(uint(GravixMath.abs(pnlWithFees)));
            }

            if (pnlWithFees > 0) {
                debt = _decreaseInsuranceFund(uint(pnlWithFees));
            }

            emit ClosePosition(msg.sender, positionKey, _positionView);
            if (debt > 0) {
                emit Debt(msg.sender, debt);
            }
            uint userNetUsdt = uint(int(collateral) + pnlWithFees - int(debt) - int(_positionView.closeFee));
            usdt.transfer(msg.sender, userNetUsdt);
        }

    }

    function liquidatePositions(LiquidationConfig[] memory liquidationConfig) public {
        for (uint i = 0; i < liquidationConfig.length; i++) {
            LiquidationConfig memory config = liquidationConfig[i];

            require(!markets[config.marketIdx].paused, "Market closed");
            require(_checkSign(config.assetPrice, config.timestamp, config.marketIdx, config.signature));

            liquidatePositionsByMarket(config.marketIdx, config.assetPrice, config.positions);
        }
    }

    function liquidatePositionsByMarket(uint marketIdx, uint assetPrice, PositionIdx[] memory _positions) internal {
        Funding memory _funding = _updateFunding(marketIdx, assetPrice);
        for(uint i = 0; i < _positions.length; i++) {
            PositionIdx memory positionIdx = _positions[i];
            Position memory position = positions[positionIdx.user][positionIdx.positionKey];
            require(position.initialCollateral > 0, "Position not found");
            require(position.marketIdx == marketIdx, "Position doesn't match marketIdx");

            PositionView memory positionView = _getPositionView(
                position,
                ViewInputInternal({
                    funding: _funding,
                    assetPrice: assetPrice
            }));

            require(positionView.liquidate, "Position is not liquidatable");
            delete positions[positionIdx.user][positionIdx.positionKey];

            uint collateral = positionView.position.initialCollateral - positionView.position.openFee;
            collateralReserve -= collateral;
            uint initialPositionSizeAsset = calculatePositionAssetSize(collateral, positionView.position.leverage, positionView.position.openPrice);
            _removePositionFromMarket(
                positionView.position.marketIdx,
                initialPositionSizeAsset,
                assetPrice,
                positionView.position.positionType
            );

            uint liquidatorReward = Math.mulDiv(collateral, liquidationParams.rewardShare, Constants.HUNDRED_PERCENT);

            _increaseInsuranceFund(collateral - liquidatorReward);

            emit LiquidatePosition(positionIdx.user, msg.sender, positionIdx.positionKey, positionView);

            usdt.transfer(msg.sender, liquidatorReward);

        }

    }
}

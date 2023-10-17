// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../interfaces/~IGravix.sol";
import "../libraries/~GravixMath.sol";
import "./~GravixLiquidityPool.sol";
import "@openzeppelin/contracts/utils/math/~Math.sol";
import "../libraries/~Errors.sol";


abstract contract GravixOrderHelpers is GravixLiquidityPool {


    function applyOpenSpread(
        uint price,
        IGravix.PositionType _type,
        uint spread
    ) public returns (uint newPrice) {

        return GravixMath.applyOpenSpread(price, _type, spread);
    }
    function getPositionView(ViewInput memory input) public view returns (PositionView memory positionView) {
        Position memory _position = positions[input.user][input.positionKey];
        require(_position.createdAt > 0, "Position not found");

        return _getPositionView(_position, ViewInputInternal({
            assetPrice : input.assetPrice,
            funding : input.funding
        }));
    }
    function _getPositionView(
        Position memory _position,
        ViewInputInternal memory input
    ) internal view returns (PositionView memory positionView) {
        bool isLong = _position.positionType == IGravix.PositionType.Long;

        uint collateral = _position.initialCollateral - _position.openFee;
        (uint leveragedPositionUsd, uint leveragedPositionAsset) = GravixMath.calculateLeveragedPosition(
            collateral, _position.leverage, _position.openPrice
        );

        uint borrowFeeUsd = GravixMath.calculateBorrowFee(
            leveragedPositionUsd, _position.createdAt, _position.borrowBaseRatePerHour
        );

        int newAccFunding = isLong ? input.funding.accLongUSDFundingPerShare : input.funding.accShortUSDFundingPerShare;
        int fundingFeeUsd = GravixMath.calculateFundingFee(newAccFunding, _position.accUSDFundingPerShare, leveragedPositionAsset);

        uint closePrice = GravixMath.applyCloseSpread(input.assetPrice, _position.positionType, _position.baseSpreadRate);
        // pnl (no funding and borrow fees)
        int pnl = GravixMath.calculatePnl(
            _position.openPrice, closePrice, _position.positionType, leveragedPositionUsd
        );
        // liquidation price
        uint liqPrice = GravixMath.calculateLiquidationPrice(
            _position.openPrice,
            collateral,
            _position.positionType,
            borrowFeeUsd,
            fundingFeeUsd,
            leveragedPositionUsd,
            _position.liquidationThresholdRate,
            _position.baseSpreadRate
        );

        int upPos = int(leveragedPositionUsd) + pnl - fundingFeeUsd - int(borrowFeeUsd);
        uint closeFee = Math.mulDiv(uint(GravixMath.max(upPos, 0)), _position.closeFeeRate, Constants.HUNDRED_PERCENT);

        // now check if position could be liquidated
        //        int256 currentCollateral = collateral - borrowFee - fundingFee + pnl;
        //        uint128 liqThreshold = math.muldiv(collateral, position.liquidationThresholdRate, Constants.HUNDRED_PERCENT);
        //        bool liquidate = currentCollateral <= liqThreshold;
        bool liquidate = isLong ? input.assetPrice <= liqPrice : input.assetPrice >= liqPrice;

        return PositionView(
            _position,
            leveragedPositionUsd,
            closePrice,
            borrowFeeUsd,
            fundingFeeUsd,
            closeFee,
            liqPrice,
            pnl,
            liquidate,
            block.timestamp
        );
    }

    function _collectOpenFee(uint amount) internal {
        _collectFeeWithSchema(openFeeDistributionSchema, amount);
    }

    function _collectFeeWithSchema(uint[2] memory feeSchema, uint amount) internal {
        uint poolFee = Math.mulDiv(amount, feeSchema[uint(FeeDistributionSchema.Pool)], Constants.HUNDRED_PERCENT);
        uint fundFee = amount - poolFee;

        if (fundFee > 0) _increaseInsuranceFund(fundFee);
        if (poolFee > 0) {
            poolAssets.balance += poolFee;
            emit LiquidityPoolFees(poolFee);
            // we are in undercollaterized state and recover is finished
            if (poolAssets.targetPrice > 0 && poolDebt() == 0) poolAssets.targetPrice = 0;
        }
    }

    function getDynamicSpread(
        uint positionSizeAsset,
        Market memory _market,
        PositionType positionType
    ) public view  returns (uint dynamicSpread) {
        uint newNoi;

        // calculate dynamic dynamicSpread multiplier
        if (positionType == PositionType.Long) {
            uint newLongsTotal = _market.totalLongsAsset + positionSizeAsset / 2;
            newNoi = newLongsTotal - Math.min(_market.totalShortsAsset, newLongsTotal);
        } else {
            uint newShortsTotal = _market.totalShortsAsset + positionSizeAsset / 2;
            newNoi = newShortsTotal - Math.min(_market.totalLongsAsset, newShortsTotal);
        }

        dynamicSpread = Math.mulDiv(newNoi, _market.fees.baseDynamicSpreadRate, _market.depthAsset);
        return dynamicSpread;
    }

    //region calculators
    // @param collateral - order collateral, 6 decimals number
    // @param leverage - order leverage, 2 decimals number
    // @param assetPrice - position price, 8 decimals number
    function calculatePositionAssetSize(uint collateral, uint leverage, uint assetPrice) public view returns (uint positionSizeAsset) {
        return Math.mulDiv(Math.mulDiv(collateral, leverage, Constants.LEVERAGE_BASE), Constants.PRICE_DECIMALS, assetPrice);
    }

    function _updateFunding(uint marketIdx, uint assetPrice) internal returns (Funding memory funding) {
        Market storage _market = markets[marketIdx];

        if (_market.lastFundingUpdateTime == block.timestamp) {
            return _market.funding;
        }

        if (_market.lastFundingUpdateTime == 0) _market.lastFundingUpdateTime = block.timestamp;

        _market.funding = _getUpdatedFunding(_market, assetPrice);
        _market.lastFundingUpdateTime = block.timestamp;

        markets[marketIdx] = _market;
        return _market.funding;
    }


    function _getUpdatedFunding(Market storage _market, uint assetPrice) internal returns (Funding memory _funding) {
        if (_market.lastFundingUpdateTime == 0) _market.lastFundingUpdateTime = block.timestamp;
        (int longRatePerHour, int shortRatePerHour) = _getFundingRates(_market);

        _funding.accLongUSDFundingPerShare = _market.funding.accLongUSDFundingPerShare + _calculateFunding(
            longRatePerHour,
            _market.totalLongsAsset,
            assetPrice,
            _market.lastFundingUpdateTime
        );

        _funding.accShortUSDFundingPerShare = _market.funding.accShortUSDFundingPerShare + _calculateFunding(
            shortRatePerHour,
            _market.totalShortsAsset,
            assetPrice,
            _market.lastFundingUpdateTime
        );

        return _funding;
    }

    function _getFundingRates(Market storage _market) internal returns (int longRatePerHour, int shortRatePerHour) {
        uint noi = uint(GravixMath.abs(int(_market.totalLongsAsset) - int(_market.totalShortsAsset)));
        uint fundingRatePerHour = Math.mulDiv(
            _market.fees.fundingBaseRatePerHour,
            Math.mulDiv(noi, Constants.SCALING_FACTOR, _market.depthAsset),
            Constants.SCALING_FACTOR
        );

        if (_market.totalLongsAsset >= _market.totalShortsAsset) {
            longRatePerHour = int(fundingRatePerHour);
            if (_market.totalShortsAsset > 0) {
                shortRatePerHour = -1 * int(
                    Math.mulDiv(fundingRatePerHour, _market.totalLongsAsset, _market.totalShortsAsset)
                );
            }
        } else {
            shortRatePerHour = int(fundingRatePerHour);
            if (_market.totalLongsAsset > 0) {
                longRatePerHour = -1 * int(Math.mulDiv(fundingRatePerHour, _market.totalShortsAsset, _market.totalLongsAsset));
            }
        }
        return (longRatePerHour, shortRatePerHour);
    }

    // @dev Will not apply changes if _error > 0
    // @param marketIdx - market id
    // @param positionSizeAsset - position value in asset, 6 decimals number
    // @param curAssetPrice - position price, 8 decimals number
    // @param positionType - 0 - long, 1 - short
    function _addPositionToMarketOrReturnErr(
        uint marketIdx, uint positionSizeAsset, uint curAssetPrice, PositionType positionType
    ) internal returns (uint16) {
        (
            Market storage _market,
            uint _totalNOI,
            uint16 _error
        ) = _calculatePositionImpactAndCheckAllowed(marketIdx, positionSizeAsset, curAssetPrice, positionType);
        if (_error == 0) {
            markets[marketIdx] = _market;
            totalNOI = _totalNOI;
        }
        return _error;
    }

    // @param marketIdx - market id
    // @param positionSizeAsset - position value in asset, 6 decimals number
    // @param curAssetPrice - position price, 8 decimals number
    // @param positionType - 0 - long, 1 - short
    function _calculatePositionImpactAndCheckAllowed(
        uint marketIdx,
        uint positionSizeAsset,
        uint curAssetPrice,
        PositionType positionType
    ) internal returns (Market storage _market, uint _totalNOI, uint16 _error) {
        (_market, _totalNOI) = _calculatePositionImpact(marketIdx, positionSizeAsset, curAssetPrice, positionType, false);

        uint shortsUsd = Math.mulDiv(_market.totalShortsAsset, curAssetPrice, Constants.PRICE_DECIMALS);
        uint longsUsd = Math.mulDiv(_market.totalLongsAsset, curAssetPrice, Constants.PRICE_DECIMALS);
        // market limits
        if (shortsUsd > _market.maxTotalShortsUSD || longsUsd > _market.maxTotalLongsUSD) _error = Errors.MARKET_POSITIONS_LIMIT_REACHED;
        // common platform limit
        if (totalNOILimitEnabled && Math.mulDiv(
            poolAssets.balance,
            maxPoolUtilRatio,
            Constants.HUNDRED_PERCENT
        ) < _totalNOI) _error = Errors.PLATFORM_POSITIONS_LIMIT_REACHED;
        return (_market, _totalNOI, _error);
    }

    // @param marketIdx - market id
    // @param positionSizeAsset - position value in asset, 6 decimals number
    // @param curAssetPrice - asset price on moment of update, required for TNOI calculation, 8 decimals number
    // @param positionType - 0 - long, 1 - short
    // @param bool - whether position is removed or added
    function _calculatePositionImpact(
        uint marketIdx, uint positionSizeAsset, uint curAssetPrice, PositionType positionType, bool remove
    ) internal returns (Market storage _market, uint _totalNOI) {
        _market = markets[marketIdx];
        _totalNOI = totalNOI;

        uint noiAssetBefore = _marketNOI(_market);
        uint noiUsdBefore = Math.mulDiv(noiAssetBefore, _market.lastNoiUpdatePrice, Constants.PRICE_DECIMALS);

        if (positionType == PositionType.Long) {
            _market.totalLongsAsset = remove ? (_market.totalLongsAsset - positionSizeAsset) : (_market.totalLongsAsset + positionSizeAsset);
        } else {
            _market.totalShortsAsset = remove ? (_market.totalShortsAsset - positionSizeAsset) : (_market.totalShortsAsset + positionSizeAsset);
        }

        uint noiAssetAfter = _marketNOI(_market);
        uint noiUsdAfter = Math.mulDiv(noiAssetAfter, curAssetPrice, Constants.PRICE_DECIMALS);

        _totalNOI -= Math.mulDiv(noiUsdBefore, _market.noiWeight, Constants.WEIGHT_BASE);
        _totalNOI += Math.mulDiv(noiUsdAfter, _market.noiWeight, Constants.WEIGHT_BASE);

        _market.lastNoiUpdatePrice = curAssetPrice;
    }

    function _marketNOI(Market storage _market) internal returns (uint) {
        return _market.totalLongsAsset > _market.totalShortsAsset ?
            _market.totalLongsAsset - _market.totalShortsAsset :
            _market.totalShortsAsset - _market.totalLongsAsset;
    }

    // @param assetPrice - asset price, 8 decimals number
    function _calculateFunding(
        int256 ratePerHour,
        uint totalPosition,
        uint assetPrice,
        uint lastUpdateTime
    ) internal returns (int) {
        if (ratePerHour == 0 || totalPosition == 0) return 0;
        // multiply by SCALING FACTOR in the beginning to prevent precision loss
        int256 fundingAsset = ratePerHour * int(Constants.SCALING_FACTOR) * int(totalPosition) / int(Constants.HUNDRED_PERCENT);
        fundingAsset = fundingAsset * int(block.timestamp - lastUpdateTime) / int(Constants.HOUR);
        int256 fundingUsd = fundingAsset * int(assetPrice) / int(Constants.PRICE_DECIMALS);
        return fundingUsd / int(totalPosition);
    }

    // @param curAssetPrice - asset price on moment of update, required for TNOI calculation, 8 decimals number
    function _removePositionFromMarket(
        uint marketIdx,
        uint positionSizeAsset,
        uint curAssetPrice,
        PositionType positionType
    ) internal {
        (
            markets[marketIdx],
            totalNOI
        ) = _calculatePositionImpact(marketIdx, positionSizeAsset, curAssetPrice, positionType, true);
    }

    function _collectCloseFee(uint amount) internal {
        _collectFeeWithSchema(closeFeeDistributionSchema, amount);
    }
}

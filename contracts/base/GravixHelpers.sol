// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../interfaces/IGravix.sol";
import "../libraries/GravixMath.sol";
import "./GravixLiquidityPool.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";


abstract contract GravixOrderHelpers is GravixLiquidityPool {
    // @param price - 8 decimals number

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
}

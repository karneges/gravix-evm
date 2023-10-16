// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../interfaces/IGravix.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./Constants.sol";


library GravixMath {
    // @param price - 8 decimals number
    function applyOpenSpread(uint price, IGravix.PositionType _type, uint spread) internal returns (uint newPrice) {
        newPrice = _type == IGravix.PositionType.Long ?
            Math.mulDiv(price, (Constants.HUNDRED_PERCENT + spread), Constants.HUNDRED_PERCENT) :
            Math.mulDiv(price, (Constants.HUNDRED_PERCENT - spread), Constants.HUNDRED_PERCENT);
        return newPrice;
    }

    function applyCloseSpread(uint price, IGravix.PositionType _type, uint spread) internal pure returns (uint newPrice) {
        newPrice = _type == IGravix.PositionType.Long ?
            Math.mulDiv(price, (Constants.HUNDRED_PERCENT - spread), Constants.HUNDRED_PERCENT) :
            Math.mulDiv(price, (Constants.HUNDRED_PERCENT + spread), Constants.HUNDRED_PERCENT);
        return newPrice;
    }

    function calculateLeveragedPosition(
        uint collateral, // collateral - openFee
        uint leverage,
        uint openPrice
    ) internal pure returns (uint leveragedPositionUsd, uint leveragedPositionAsset) {
        leveragedPositionUsd = Math.mulDiv(collateral, leverage, Constants.LEVERAGE_BASE);
        leveragedPositionAsset = Math.mulDiv(leveragedPositionUsd, Constants.PRICE_DECIMALS, openPrice);
    }

    function calculateBorrowFee(
        uint leveragedPositionUsd,
        uint createdAt,
        uint borrowBaseRatePerHour
    ) internal view returns (uint borrowFee) {
        uint timePassed = block.timestamp - createdAt;
        uint borrowFeeShare = Math.mulDiv(borrowBaseRatePerHour, timePassed, Constants.HOUR);
        borrowFee = Math.mulDiv(borrowFeeShare, leveragedPositionUsd, Constants.HUNDRED_PERCENT);
    }

    function calculateFundingFee(
        int256 newAccFunding,
        int256 posAccFunding,
        uint leveragedPositionAsset
    ) internal pure returns (int256 fundingFeeUsd) {
        int256 fundingDebt = int256(leveragedPositionAsset) * posAccFunding / int256(Constants.SCALING_FACTOR);
        // if fundingFee > 0, trader pays
        fundingFeeUsd = int256(leveragedPositionAsset) * newAccFunding / int256(Constants.SCALING_FACTOR) - fundingDebt;
    }

    function calculatePnl(
        uint openPrice, // including spread
        uint closePrice, // including spread
        IGravix.PositionType posType,
        uint leveragedPos // (collateral - open fee) * leverage
    ) internal pure returns (int256 pnl) {
        // (closePrice/openPrice - 1)
        pnl = int256(Math.mulDiv(closePrice, Constants.SCALING_FACTOR, openPrice)) - int256(Constants.SCALING_FACTOR);
        // * (-1) for shorts
        pnl = (posType == IGravix.PositionType.Long) ? pnl : -pnl;
        // * collateral * leverage
        pnl = pnl * int256(leveragedPos) / int256(Constants.SCALING_FACTOR);
    }

    function calculateLiquidationPriceDistance(
        uint openPrice, // including spread
        uint collateral, // minus open fee
        uint borrowFee,
        int256 fundingFee,
        uint leveragedPos, // (collateral - open fee) * leverage
        uint liquidationThresholdRate // %
    ) internal pure returns (int256 liqPriceDist) {
        // collateral * 0.9
        liqPriceDist = int256(Math.mulDiv(collateral, (Constants.HUNDRED_PERCENT - liquidationThresholdRate),  Constants.HUNDRED_PERCENT));
        // - borrowFee - fundingFeeUsd
        liqPriceDist -= int256(borrowFee) + fundingFee;
        // * openPrice / collateral / leverage
        liqPriceDist = int256(openPrice) * liqPriceDist / int256(leveragedPos);
    }

    function calculateLiquidationPrice(
        uint openPrice, // including spread
        uint collateral, // minus open fee
        IGravix.PositionType posType,
        uint borrowFee,
        int256 fundingFee,
        uint leveragedPos, // (collateral - open fee) * leverage
        uint liquidationThresholdRate, // %
        uint baseSpreadRate // %
    ) internal pure returns (uint liqPrice) {
        int256 liqPriceDist = calculateLiquidationPriceDistance(
            openPrice,
            collateral,
            borrowFee,
            fundingFee,
            leveragedPos,
            liquidationThresholdRate
        );
        int256 _liqPrice_raw = posType == IGravix.PositionType.Long
            ? (int256(openPrice) - liqPriceDist) * int256(Constants.HUNDRED_PERCENT) / int256(Constants.HUNDRED_PERCENT - baseSpreadRate)
            : (int256(openPrice) + liqPriceDist) * int256(Constants.HUNDRED_PERCENT) / int256(Constants.HUNDRED_PERCENT + baseSpreadRate);
        liqPrice = uint(max(_liqPrice_raw, 0)); // price cant be negative
    }

    function calculateLiquidationPrice(
        uint openPrice, // including spread
        uint collateral, // minus open fee
        IGravix.PositionType posType,
        uint leveragedPos, // (collateral - open fee) * leverage
        uint liquidationThresholdRate, // %
        uint baseSpreadRate // %
    ) internal pure returns (uint) {
        return calculateLiquidationPrice(
            openPrice, collateral, posType, 0, 0, leveragedPos, liquidationThresholdRate, baseSpreadRate
        );
    }

    function max(uint a, uint b) internal pure returns (uint) {
        return a > b ? a : b;
    }
    function max(int a, int b) internal pure returns (int) {
        return a > b ? a : b;
    }
    function min(uint a, uint b) internal pure returns (uint) {
        return a < b ? a : b;
    }
    function min(int a, int b) internal pure returns (int) {
        return a < b ? a : b;
    }

    function abs(int a) internal pure returns (int) {
        return a < 0 ? -a : a;
    }

}

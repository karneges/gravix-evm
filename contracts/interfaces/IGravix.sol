// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IGravix {
    event NewMarket(
        MarketConfig market
    );
    event LiquidityPoolDeposit(address user, uint usdtAmountIn, uint stgUsdtAmountOut);
    event InsuranceFundDeposit(address user, uint amount);
    event LiquidityPoolWithdraw(address user, uint usdtAmountOut, uint stgUsdtAmountIn);

    enum PositionType {
        Long,
        Short
    }
    struct InsuranceFund {
        uint balance; // collected fees, pnl and etc.
        uint limit;
    }
    struct Position {
        uint marketIdx;
        PositionType positionType;
        uint initialCollateral; // 6 decimals number
        uint openFee; // amount of usdt taken when position was opened
        uint openPrice; // 8 decimals number
        uint markPrice; // 8 decimals number
        uint leverage;
        int256 accUSDFundingPerShare;
        uint borrowBaseRatePerHour; // % per hour
        uint baseSpreadRate; // %
        uint closeFeeRate; // %
        uint liquidationThresholdRate; // %
        uint createdAt; // %
    }

    struct Funding {
        int256 accLongUSDFundingPerShare;
        int256 accShortUSDFundingPerShare;
    }

    struct Fees {
        // fee and rates in %
        uint openFeeRate;
        uint closeFeeRate;
        uint baseSpreadRate;
        uint baseDynamicSpreadRate;
        uint borrowBaseRatePerHour;
        uint fundingBaseRatePerHour;
    }

    struct Market {
        uint totalLongsAsset;
        uint totalShortsAsset;
        uint maxTotalLongsUSD;
        uint maxTotalShortsUSD;
        uint lastNoiUpdatePrice;
        uint noiWeight; // 100 -> 1x
        Funding funding;
        uint lastFundingUpdateTime;
        uint maxLeverage; // 10**6 -> 1x
        uint depthAsset;
        Fees fees;
        bool paused;
    }

    struct LiquidationParams {
        uint thresholdRate;
        uint rewardShare;
    }

    struct PoolAssets {
        uint balance; // liquidity deposits
        uint stgUsdtSupply; // amount of minted stgUsdt
        uint targetPrice;
    }

    struct MarketConfig {
        uint maxLongsUSD;
        uint maxShortsUSD;
        uint noiWeight;
        uint maxLeverage;
        uint depthAsset;
        Fees fees;
    }
}

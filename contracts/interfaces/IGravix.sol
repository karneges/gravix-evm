// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IGravix {
    event NewMarket(
        MarketConfig market
    );
    event LiquidityPoolDeposit(address user, uint usdtAmountIn, uint stgUsdtAmountOut);
    event InsuranceFundDeposit(address user, uint amount);
    event LiquidityPoolWithdraw(address user, uint usdtAmountOut, uint stgUsdtAmountIn);
    event MarketOrderExecution(
        address user,
        Position position,
        uint positionKey
    );
    event LiquidityPoolFees(uint fees);
    event LiquidatePosition(address user, address liquidator, uint positionKey, PositionView positionView);
    event ClosePosition(address user, uint positionKey, PositionView positionView);
    event Debt(address user, uint debt);

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
        int accUSDFundingPerShare;
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

    struct ViewInputInternal {
        uint assetPrice; // 8 decimals number
        Funding funding;
    }
    struct ViewInput {
        uint positionKey;
        address user;
        uint assetPrice; // 8 decimals number
        Funding funding;
    }

    struct PositionView {
        Position position;
        uint positionSizeUSD; // 6 decimals number
        uint closePrice; // 8 decimals number
        uint borrowFee; // 6 decimals number
        int fundingFee; // 6 decimals number
        uint closeFee; // 6 decimals number
        uint liquidationPrice; // 8 decimals number
        int pnl; // 6 decimals number
        bool liquidate;
        uint viewTime;
    }

    struct Treasuries {
        address treasury;
        address projectFund;
        address devFund;
    }
    struct Details {
        address priceNode;
        address usdt;
        address stgUsdt;
        Treasuries treasuries;
        PoolAssets poolAssets;
        InsuranceFund insuranceFunds; // collected fees, pnl and etc.,
        uint[3] insuranceFundOverflowDistributionSchema;
        uint collateralReserve; // sum of all usdt provided as a collateral for open order
        uint totalNOI;
        bool totalNOILimitEnabled;
        uint maxPoolUtilRatio;
        uint maxPnlRate;
        uint minPositionCollateral;
        bool paused;
        LiquidationParams liquidation;
        uint[2] openFeeDistributionSchema;
        uint[2] closeFeeDistributionSchema;
        uint marketCount;
    }

    struct LiquidationConfig {
        uint marketIdx;
        uint assetPrice;
        uint timestamp;
        bytes signature;
        PositionIdx[] positions;
    }

    struct PositionIdx {
        address user;
        uint positionKey;
    }
}

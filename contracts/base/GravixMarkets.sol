// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./GravixLiquidityPool.sol";
import "./GravixHelpers.sol";

abstract contract GravixMarkets is GravixOrderHelpers {

    function validateMarketConfig(MarketConfig memory config) public pure returns (bool correct) {
        correct = true && config.maxLeverage >= Constants.LEVERAGE_BASE;
        correct = correct && config.fees.fundingBaseRatePerHour < Constants.HUNDRED_PERCENT;
        correct = correct && config.fees.borrowBaseRatePerHour < Constants.HUNDRED_PERCENT;
        correct = correct && config.fees.baseSpreadRate < Constants.HUNDRED_PERCENT;
        correct = correct && config.fees.baseDynamicSpreadRate < Constants.HUNDRED_PERCENT;
        correct = correct && config.fees.closeFeeRate < Constants.HUNDRED_PERCENT;
        correct = correct && config.fees.openFeeRate < Constants.HUNDRED_PERCENT;
    }

    function addMarkets(
        MarketConfig[] memory newMarkets
    ) external {

        for (uint i = 0; i < newMarkets.length; i++) {
            MarketConfig memory _marketConfig = newMarkets[i];
            require (validateMarketConfig(_marketConfig), "Bad input");

            Market memory newMarket;
            newMarket.maxTotalLongsUSD = _marketConfig.maxLongsUSD;
            newMarket.maxTotalShortsUSD = _marketConfig.maxShortsUSD;
            newMarket.noiWeight = _marketConfig.noiWeight;
            newMarket.maxLeverage = _marketConfig.maxLeverage;
            newMarket.depthAsset = _marketConfig.depthAsset;
            newMarket.fees = _marketConfig.fees;

            markets[marketCount] = newMarket;
            marketCount += 1;

            emit NewMarket(_marketConfig);
        }
    }
}

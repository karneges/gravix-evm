// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./GravixMarketPositions.sol";

abstract contract GravixBase is GravixMarketPositions {

    function getDetails() public view returns (Details memory)  {
        return Details({
            priceNode: priceNode,
            usdt: address(usdt),
            stgUsdt: address(stgUsdt),
            treasuries: treasuries,
            poolAssets: poolAssets,
            insuranceFunds: insuranceFund,
            insuranceFundOverflowDistributionSchema:insuranceFundOverflowDistributionSchema,
            collateralReserve: collateralReserve,
            totalNOI: totalNOI,
            totalNOILimitEnabled:totalNOILimitEnabled,
            maxPoolUtilRatio: maxPoolUtilRatio,
            maxPnlRate: maxPnlRate,
            minPositionCollateral: minPositionCollateral,
            paused: paused,
            liquidation: liquidationParams,
            openFeeDistributionSchema: openFeeDistributionSchema,
            closeFeeDistributionSchema: closeFeeDistributionSchema,
            marketCount: marketCount
        });
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../interfaces/IGravix.sol";
import "../libraries/Constants.sol";

abstract contract GravixStorage is IGravix {


    mapping(
        //marketIdx
        uint => mapping(
            // userAddress
            address => mapping(
                // positionIdx
                uint => IGravix.Position
            )
        )
    ) public positions;

    mapping (uint => IGravix.Market) public markets;
    uint public requestNonce = 0;

    LiquidationParams public liquidationParams = LiquidationParams({
        thresholdRate: 100_000_000_000, // 10%,
        rewardShare: 20_000_000_000 // 2%. Share of liquidated collateral that liquidator collect,
    });

    // liquidity pool staff
    PoolAssets poolAssets;
    // total net open interest across all markets according to weights
    // market noi - abs of (sum of all open longs - sum of all open shorts)
    uint totalNOI;
    bool totalNOILimitEnabled;
    uint maxPoolUtilRatio = 1_000_000_000_000; // 100%, multiplied by 1_000_000_000_000
    uint maxPnlRate = 3_000_000_000_000; // 300%, multiplied by 1_000_000_000_000
    uint minPositionCollateral = 5 * Constants.USDT_DECIMALS; // 5$

}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../interfaces/IGravix.sol";
import "../libraries/Constants.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IERC20Minter.sol";

abstract contract GravixStorage is IGravix {


    mapping(
            // userAddress
            address => mapping(
                // positionIdx
                uint => IGravix.Position
            )
    ) public positions;

    mapping (uint => IGravix.Market) public markets;
    uint public requestNonce = 0;
    address public priceNode;
    InsuranceFund public insuranceFund;
    IERC20 public usdt;
    IERC20Minter public stgUsdt;
    Treasuries treasuries;

    LiquidationParams public liquidationParams = LiquidationParams({
        thresholdRate: 100_000_000_000, // 10%,
        rewardShare: 20_000_000_000 // 2%. Share of liquidated collateral that liquidator collect,
    });
    uint[3] insuranceFundOverflowDistributionSchema = [
        Constants.HUNDRED_PERCENT / 2,
        (Constants.HUNDRED_PERCENT * 3) / 10,
        Constants.HUNDRED_PERCENT / 5
    ];
    uint collateralReserve; // sum of all usdt provided as a collateral for open orders
    // liquidity pool staff
    PoolAssets public poolAssets;
    // total net open interest across all markets according to weights
    // market noi - abs of (sum of all open longs - sum of all open shorts)
    uint totalNOI;
    bool totalNOILimitEnabled;
    uint maxPoolUtilRatio = 1_000_000_000_000; // 100%, multiplied by 1_000_000_000_000
    uint maxPnlRate = 3_000_000_000_000; // 300%, multiplied by 1_000_000_000_000
    uint minPositionCollateral = 5 * Constants.USDT_DECIMALS; // 5$
    bool paused;

    uint marketCount = 0;
    uint[2] openFeeDistributionSchema = [Constants.HUNDRED_PERCENT, 0];
    uint[2] closeFeeDistributionSchema = [0, Constants.HUNDRED_PERCENT];
    enum FeeDistributionSchema { Pool, InsuranceFund }

}

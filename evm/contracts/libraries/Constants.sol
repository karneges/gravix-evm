// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

library Constants {
    uint constant SCALING_FACTOR = 10**18;
    uint constant USDT_DECIMALS = 10**6;
    uint constant PRICE_DECIMALS = 10**8; // chainlink standard
    uint constant LEVERAGE_BASE = 10**6; // 1_000_000 -> 1x
    uint constant WEIGHT_BASE = 100; // 100 -> 1x
    uint constant HUNDRED_PERCENT = 1_000_000_000_000; // 100%, this allows precision up to 0.0000000001%
    uint constant HOUR = 3600;
}

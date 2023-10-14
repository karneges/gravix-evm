// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../interfaces/IGravix.sol";
import "../libraries/GravixMath.sol";

abstract contract GravixOrderHelpers {
    // @param price - 8 decimals number

    function applyOpenSpread(
        uint price,
        IGravix.PositionType _type,
        uint spread
    ) public returns (uint newPrice) {
        return GravixMath.applyOpenSpread(price, _type, spread);
    }
}

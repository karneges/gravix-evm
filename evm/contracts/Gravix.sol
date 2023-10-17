// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./base/GravixMarketPositions.sol";

contract Gravix is Ownable, GravixMarketPositions {
    constructor(
        address _usdt,
        address _stgUsdt,
        address _priceNode
    ) {
        usdt = IERC20(_usdt);
        stgUsdt = IERC20Minter(_stgUsdt);
        priceNode = _priceNode;
    }
}



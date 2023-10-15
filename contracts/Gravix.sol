// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./base/GravixBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Gravix is GravixBase, Ownable {
    constructor(address _usdt, address _stgUsdt) {
        usdt = IERC20(_usdt);
        stgUsdt = IERC20Minter(_stgUsdt);
    }
}



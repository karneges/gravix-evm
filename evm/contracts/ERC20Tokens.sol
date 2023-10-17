// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IERC20Minter.sol";

contract ERC20Tokens is ERC20, IERC20Minter, Ownable {
    constructor(
        string memory tokenSymbol,
        string memory tokenName
    ) ERC20(tokenSymbol, tokenName) {}

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) public override onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public override onlyOwner {
        _burn(from, amount);
    }
}

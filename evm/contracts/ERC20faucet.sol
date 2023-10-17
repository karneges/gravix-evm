pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IERC20Minter.sol";

contract ERC20Faucet is Ownable {
    IERC20Minter public tokenAddress;
    constructor(address _tokenAddress){
        tokenAddress = IERC20Minter(_tokenAddress);
    }

    function mint(address to, uint256 amount) public {
        tokenAddress.mint(to, amount);
    }
}

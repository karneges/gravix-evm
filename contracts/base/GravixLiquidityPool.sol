// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./GravixStorage.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../interfaces/IERC20Minter.sol";

abstract contract GravixLiquidityPool is GravixStorage {

    function depositLiquidity(
        uint amount
    ) external {
        usdt.transferFrom(msg.sender, address(this), amount);
        uint mintAmount = usdtToStgUsdt(amount);

        poolAssets.balance += amount;
        poolAssets.stgUsdtSupply += mintAmount;
        stgUsdt.mint(msg.sender, amount);
        emit LiquidityPoolDeposit(msg.sender, amount, mintAmount);
    }

    function usdtToStgUsdt(uint usdtAmount) public view returns (uint stgAmount) {
        if (poolAssets.stgUsdtSupply == 0) {
            stgAmount = usdtAmount;
        } else {
            (uint inPrice,) = stgUsdtPrice();
            stgAmount = Math.mulDiv(usdtAmount, Constants.PRICE_DECIMALS, inPrice);
        }
        return stgAmount;
    }

    // @dev Prices are multiplied by 10**8
    // in price could be higher in case of under collateralization
    function stgUsdtPrice() public view returns (uint inPrice, uint outPrice) {
        if (poolAssets.stgUsdtSupply == 0) {
            (inPrice, outPrice) = (Constants.PRICE_DECIMALS, Constants.PRICE_DECIMALS);
        } else {
            // out price is current real price
            outPrice = Math.mulDiv(poolAssets.balance, Constants.PRICE_DECIMALS, poolAssets.stgUsdtSupply);
            // if we are in under collateralized state
            inPrice = poolAssets.targetPrice > 0 ? poolAssets.targetPrice : outPrice;
        }
        return (inPrice, outPrice);
    }

    function _handleInsuranceDeposit(uint amount) internal returns(bool) {

        _increaseInsuranceFund(amount);
        emit InsuranceFundDeposit(msg.sender, amount);
        return true;
    }

    function _increaseInsuranceFund(uint amount) internal {
        if (poolAssets.targetPrice > 0) {
            uint debt = poolDebt();
            poolAssets.balance += Math.min(debt, amount);
            amount -= Math.min(debt, amount);
            if (amount > 0) poolAssets.targetPrice = 0;
        }
        insuranceFund.balance += amount;
    }

    function poolDebt() public view returns (uint) {
        uint targetBalance = Math.mulDiv(poolAssets.stgUsdtSupply, poolAssets.targetPrice, Constants.PRICE_DECIMALS);
        return poolAssets.balance >= targetBalance ? 0 : targetBalance - poolAssets.balance;
    }


    function withdrawLiquidity(uint stgUsdtAmount) external {
        stgUsdt.transferFrom(msg.sender, address(this), stgUsdtAmount);
        stgUsdt.burn(msg.sender, stgUsdtAmount);
        uint usdtAmount = stgUsdtToUsdt(stgUsdtAmount);

        poolAssets.balance -= usdtAmount;
        poolAssets.stgUsdtSupply -= stgUsdtAmount;
        emit LiquidityPoolWithdraw(msg.sender, usdtAmount, stgUsdtAmount);

    }

    function stgUsdtToUsdt(uint stgAmount) public view returns (uint usdtAmount) {
        if (poolAssets.stgUsdtSupply == 0) {
            usdtAmount = stgAmount;
        } else {
            (,uint outPrice) = stgUsdtPrice();
            usdtAmount = Math.mulDiv(stgAmount, outPrice, Constants.PRICE_DECIMALS);
        }
        return usdtAmount;
    }
}

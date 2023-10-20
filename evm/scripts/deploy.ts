import hre, { ethers } from "hardhat";

async function main() {
  const [deployer, priceNode] = await ethers.getSigners();
  const usdtToken = await ethers.deployContract("ERC20Tokens", [
    "XUSDT",
    "XUSDT",
  ]);
  console.log(`Usdt token ${await usdtToken.getAddress()}`);
  const stgUsdtToken = await ethers.deployContract("ERC20Tokens", [
    "stgXUSDT",
    "stgXUSDT",
  ]);
  console.log(`StgUsdt token ${await stgUsdtToken.getAddress()}`);
  const tokenFaucet = await ethers.deployContract("ERC20Faucet");
  console.log(`TokenFaucet ${await tokenFaucet.getAddress()}`);
  await tokenFaucet.setToken(await usdtToken.getAddress());
  console.log(`TokenFaucet set token`);
  await usdtToken.transferOwnership(await tokenFaucet.getAddress());
  console.log(`Usdt token transfer ownership`);
  const gravix = await ethers.deployContract("Gravix", [
    usdtToken,
    stgUsdtToken,
    priceNode,
  ]);
  console.log(`Gravix ${await gravix.getAddress()}`);
  await stgUsdtToken.transferOwnership(await gravix.getAddress());
  console.log(`StgUsdt token transfer ownership`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

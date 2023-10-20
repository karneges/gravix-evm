import hre, { ethers } from "hardhat";

async function main() {
  const [deployer, priceNode] = await ethers.getSigners();
  const usdtToken = await ethers.deployContract(
    "ERC20Tokens",
    ["XUSDT", "XUSDT"],
    {
      gasLimit: "0x1000000",
    },
  );
  await usdtToken.waitForDeployment();
  console.log(`Usdt token ${await usdtToken.getAddress()}`);
  const stgUsdtToken = await ethers.deployContract(
    "ERC20Tokens",
    ["stgXUSDT", "stgXUSDT"],
    {
      gasLimit: "0x1000000",
    },
  );
  await stgUsdtToken.waitForDeployment();
  console.log(`StgUsdt token ${await stgUsdtToken.getAddress()}`);
  const tokenFaucet = await ethers.deployContract("ERC20Faucet", {
    gasLimit: "0x1000000",
  });
  await tokenFaucet.waitForDeployment();
  console.log(`TokenFaucet ${await tokenFaucet.getAddress()}`);
  await tokenFaucet.setToken(await usdtToken.getAddress(), {
    gasLimit: "0x1000000",
  });

  console.log(`TokenFaucet set token`);
  await usdtToken.transferOwnership(await tokenFaucet.getAddress(), {
    gasLimit: "0x1000000",
  });

  console.log(`Usdt token transfer ownership`);
  const gravix = await ethers.deployContract(
    "Gravix",
    [usdtToken, stgUsdtToken, priceNode],
    { gasLimit: "0x1000000" },
  );
  await gravix.waitForDeployment();
  console.log(`Gravix ${await gravix.getAddress()}`);
  await stgUsdtToken.transferOwnership(await gravix.getAddress(), {
    gasLimit: "0x1000000",
  });
  console.log(`StgUsdt token transfer ownership`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import hre, { ethers } from "hardhat";

async function main() {
  const [deployer, priceNode] = await ethers.getSigners();
  const stgUstd = await ethers.getContractAt(
    "ERC20Tokens",
    "0x2533Af89885Fcc0Ea112D1427d9d14b5120595e0",
  );
  await stgUstd.transferOwnership("0x9049aF67Bef5C3c2ABD71b47F1E7D56407AF6AD9");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

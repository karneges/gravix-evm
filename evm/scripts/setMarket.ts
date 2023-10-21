import { ethers } from "hardhat";
import { MarketConfig } from "../test/types";
import { USDT_DECIMALS } from "../test/constants";

const basic_config: MarketConfig = {
  priceSource: 1,
  maxLongsUSD: 100_000n * USDT_DECIMALS, // 100k
  maxShortsUSD: 100_000n * USDT_DECIMALS, // 100k
  noiWeight: 100,
  maxLeverage: 100_000_000, // 100x
  depthAsset: 15n * USDT_DECIMALS, // 25k
  fees: {
    openFeeRate: 1000000000, // 0.1%
    closeFeeRate: 1000000000, // 0.1%
    baseSpreadRate: 1000000000, // 0.1%
    baseDynamicSpreadRate: 1000000000, // 0.1%
    borrowBaseRatePerHour: 0, // disable by default
    fundingBaseRatePerHour: 0, // disable by default
  },
  ticker: "ETHUSDT",
};
async function main() {
  const [deployer, priceNode] = await ethers.getSigners();
  const gravix = await ethers.getContractAt(
    "Gravix",
    "0x10e5E8f37f77c9E886D388B313787A2DE6246180",
  );

  // const faucet = await ethers.getContractAt(
  //   "ERC20Faucet",
  //   "0x9049aF67Bef5C3c2ABD71b47F1E7D56407AF6AD9",
  // );
  // const usdtToken = await ethers.getContractAt(
  //   "ERC20Tokens",
  //   "0x248c2193aAcDebCdD7a351968767c81FBF7B1ecB",
  // );
  // {
  //   const tx = await usdtToken.transferOwnership(faucet);
  //   console.log(tx.hash);
  // }
  // const tx = await faucet
  //   .setToken("0x248c2193aAcDebCdD7a351968767c81FBF7B1ecB")
  //   .then((res) => res.wait());
  // console.log(tx!.hash);

  const tx = await gravix
    .addMarkets([basic_config], {
      gasLimit: "0x1000000",
    })
    .then((res) => res.wait());
  // console.log(tx!.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

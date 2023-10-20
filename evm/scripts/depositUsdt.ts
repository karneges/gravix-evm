import { ethers } from "hardhat";
import { MarketConfig } from "../test/types";
import { USDT_DECIMALS } from "../test/constants";

async function main() {
  const [deployer, priceNode] = await ethers.getSigners();
  const faucet = await ethers.getContractAt(
    "ERC20Faucet",
    "0xb496B3D20CEB69321f5E17F4798683cc2DCcF3CC",
  );

  // await faucet.setToken("0x2667fC20cAD017162a6B2a29127A7F8aC88d1Ecc", {
  //   gasLimit: 1000000,
  // });

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

  await faucet
    .mint("0xfB13b34E0598B7Cbe7f9Db2A2d5B4206f87C7A91", 100_000000)
    .catch((err) => {
      console.error(err);
    });
  // console.log(tx!.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

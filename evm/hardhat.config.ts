import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  networks: {
    linea: {
      url: "https://rpc.goerli.linea.build",
      accounts: [process.env.PRIVATE_KEY_MUMBAI!],
    },
  },
  solidity: {
    version: "0.8.19",
    settings: {
      viaIR: true,

      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};

export default config;

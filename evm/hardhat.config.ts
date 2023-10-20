import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  networks: {
    linea: {
      url: "https://rpc.goerli.linea.build",
      accounts: [
        process.env.PRIVATE_KEY_MUMBAI!,
        process.env.PRIVATE_KEY_PRICE_NODE!,
      ],
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [
        process.env.PRIVATE_KEY_MUMBAI!,
        process.env.PRIVATE_KEY_PRICE_NODE!,
      ],
    },
    scroll: {
      url: "https://sepolia-rpc.scroll.io",
      accounts: [
        process.env.PRIVATE_KEY_MUMBAI!,
        process.env.PRIVATE_KEY_PRICE_NODE!,
      ],
    },
  },

  etherscan: {
    apiKey: {
      linea: process.env.LINEASCAN_API_KEY!,
    },
    customChains: [
      {
        network: "linea",
        chainId: 59140,
        urls: {
          apiURL: "https://api-testnet.lineascan.build/api",
          browserURL: "https://goerli.lineascan.build/address",
        },
      },
    ],
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

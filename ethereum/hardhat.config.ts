import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const dotenv = require("dotenv");

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork: "localhost",
  paths: {
    artifacts: "../frontend/src/artifacts/"
  },
  networks: {
    hardhat: {
  /* Uncomment the line below if metamask fix has to be done in hardhat */
  //     chainId: 1337
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [String(process.env.PRIVATE_KEY)]
    }
  }
};

export default config;

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const dotenv = require("dotenv");

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork: "localhost",
  networks: {
    hardhat: {
  /* Uncomment the line below if metamask fix has to be done in hardhat */
  //     chainId: 1337
    },
    // goerli: {
    //   url: "",
    //   accounts: {
    //     mnemonic: process.env.MNEMONIC
    //   }
    // }
  }
};

export default config;

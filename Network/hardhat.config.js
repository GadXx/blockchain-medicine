require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

module.exports = {
  networks: {
    customNetwork: {
      url: process.env.RPC_URL || "http://127.0.0.1:8545",
      ...(privateKey ? { accounts: [privateKey] } : {}),
      gasPrice: 0,
    },
  },
  solidity: "0.8.17",
};

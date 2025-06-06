// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR:   true,
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:8550",
      chainId: 1337,
      accounts: {
        mnemonic: "inner increase scissors eight brave vapor leisure perfect robot light join initial"
    }
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};

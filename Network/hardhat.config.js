require("@nomiclabs/hardhat-ethers");

module.exports = {
  networks: {
    customNetwork: {
      url: "http://127.0.0.1:8545",  // RPC-адрес твоей сети
      accounts: ["0x3ddfdd2c63afe9bf902a74d74645e3500a6513539371d39da60699206a0417ae"],    // Приватный ключ аккаунта для деплоя
      gasPrice: 0
    },
  },
  solidity: "0.8.17",  // Версия Solidity для компиляции контракта
};

const { ethers } = require("hardhat");

async function main() {
  // Получение фабрики контракта
  const ContractFactory = await ethers.getContractFactory("ContractFactory");

  // Деплой контракта
  const contract = await ContractFactory.deploy("0x00d2bC965Fe2847b2af611F7595caD24A1255533");

  await contract.deployed();
  console.log("Deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
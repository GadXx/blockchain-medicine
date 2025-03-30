const { ethers } = require("hardhat");

async function main() {

    // Получение фабрики контракта
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");

    // Деплой контракта
    const DIDRegistryContract = await DIDRegistry.deploy();
  
    await DIDRegistryContract.deployed();
    console.log("DIDRegistry Deployed to:", DIDRegistryContract.address);


  // Получение фабрики контракта
  const ContractFactory = await ethers.getContractFactory("ContractFactory");

  // Деплой контракта
  const ContractFactoryContract = await ContractFactory.deploy(DIDRegistryContract.address);

  await ContractFactoryContract.deployed();
  console.log("ContractFactory Deployed to:", ContractFactoryContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
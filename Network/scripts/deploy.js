const { ethers } = require("hardhat");

async function main() {
  // Получение фабрики контракта
  const MedicalRegistry = await ethers.getContractFactory("MedicalRegistry");

  // Деплой контракта
  const contract = await MedicalRegistry.deploy();

  await contract.deployed();
  console.log("Deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
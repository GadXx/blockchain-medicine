require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const didRegistryAddress = process.env.DID_REGISTRY_ADDRESS;
  if (!didRegistryAddress) {
    throw new Error("Set DID_REGISTRY_ADDRESS before deploying ContractFactory");
  }

  const contractFactory = await ethers.getContractFactory("ContractFactory");
  const contract = await contractFactory.deploy(didRegistryAddress);
  await contract.deployed();

  console.log(`ContractFactory deployed to: ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

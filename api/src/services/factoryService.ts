import { ethers } from "ethers";
import dotenv from "dotenv";
import { DidService } from "./didService";
import { redis } from "../config/Redis";
import { Clinic } from "../models/Clinic";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const factoryABI = [
  "function deployMedicalCard(string memory ownerDID) external returns (address)",
  "function deployClinic() external returns (address)",
  "function addClinicDeployer(address deployer) external",
  "function removeClinicDeployer(address deployer) external",
  "function deployedMedicalCards(address) external view returns (address)",
  "function deployedClinics(address) external view returns (address)"
];

const factoryContract = new ethers.Contract(
  process.env.FACTORY_CONTRACT_ADDRESS!,
  factoryABI,
  provider
);

export class FactoryService {
  private didService: DidService;

  constructor() {
    this.didService = new DidService();
  }

  public async createDeployMedicalCardTx(userID: string) {

    const didDocument = await this.didService.getDIDDocument(userID);
    if (!didDocument) throw new Error("DID document not found");

    const didString = String(didDocument.did);
    const iface = new ethers.Interface(factoryABI);
    const data = iface.encodeFunctionData("deployMedicalCard", [didString]);
    
    const tx = {
      to: process.env.FACTORY_CONTRACT_ADDRESS,
      data,
      from: didDocument.authentication.address,
      chainId: 1337,
      gasLimit: ethers.toQuantity(5000000n),
      gasPrice: ethers.toQuantity(0n),
      maxFeePerGas: ethers.toQuantity(0n),
      maxPriorityFeePerGas: ethers.toQuantity(0n),
      nonce: await provider.getTransactionCount(didDocument.authentication.address, "latest")
    };

    await redis.set(`tx:${userID}`, JSON.stringify(tx), "EX", 3600);
    return tx;
  }

  public async createDeployClinicTx(clinicID: string) {
    const clinic = await Clinic.findOne({ _id: clinicID });
    if(!clinic) {
      throw new Error('Clinic not found');
    }
    if(clinic.verified == false) {
      throw new Error('Clinic not verified');
    }
    if(!clinic.address) {
      throw new Error('Wallet address already saved');
    }
    if(clinic.contract_address) {
      throw new Error('Contract address already saved');
    }

    const iface = new ethers.Interface(factoryABI);
    const data = iface.encodeFunctionData("deployClinic");

    const tx = {
      to: process.env.FACTORY_CONTRACT_ADDRESS,
      data,
      from: clinic.address,
      chainId: 1337,
      gasLimit: ethers.toQuantity(5000000n),
      gasPrice: ethers.toQuantity(0n),
      maxFeePerGas: ethers.toQuantity(0n),
      maxPriorityFeePerGas: ethers.toQuantity(0n),
      nonce: await provider.getTransactionCount(clinic.address, "latest")
    };

    await redis.set(`tx:${clinicID}`, JSON.stringify(tx), "EX", 3600);
    
    return tx;
  }

  public async addClinicDeployerTx(userID: string, clinicID: string) {

    const clinic = await Clinic.findOne({ _id: clinicID });
    if(!clinic) {
      throw new Error('Clinic not verified');
    }
    if(!clinic.address) {
      throw new Error('Wallet address already saved');
    }

    const iface = new ethers.Interface(factoryABI);
    const data = iface.encodeFunctionData("addClinicDeployer", [clinic.address]);

    const tx = {
      to: process.env.FACTORY_CONTRACT_ADDRESS,
      data,
      from: process.env.ADMIN_ADDRESS,
      chainId: 1337,
      gasLimit: ethers.toQuantity(5000000n),
      gasPrice: ethers.toQuantity(0n),
      maxFeePerGas: ethers.toQuantity(0n),
      maxPriorityFeePerGas: ethers.toQuantity(0n),
      nonce: await provider.getTransactionCount(process.env.ADMIN_ADDRESS!, "latest")
    };

    await redis.set(`tx:${userID}`, JSON.stringify(tx), "EX", 3600);
    return tx;
  }

  public async removeClinicDeployerTx(userID: string, clinicID: string) {

    const clinic = await Clinic.findOne({ _id: clinicID });
    if(!clinic) {
      throw new Error('Clinic not found');
    }
    if(!clinic.verified) {
      throw new Error('Clinic not verified');
    }
    if(!clinic.address) {
      throw new Error('Wallet address already saved');
    }

    const iface = new ethers.Interface(factoryABI);
    const data = iface.encodeFunctionData("removeClinicDeployer", [clinic.address]);

    const tx = {
      to: process.env.FACTORY_CONTRACT_ADDRESS,
      data,
      from: process.env.ADMIN_ADDRESS,
      chainId: 1337,
      gasLimit: ethers.toQuantity(5000000n),
      gasPrice: ethers.toQuantity(0n),
      maxFeePerGas: ethers.toQuantity(0n),
      maxPriorityFeePerGas: ethers.toQuantity(0n),
      nonce: await provider.getTransactionCount(clinic.address, "latest")
    };

    await redis.set(`tx:${userID}`, JSON.stringify(tx), "EX", 3600);
    return tx;
  }

  public async getDeployedMedicalCard(userAddress: string) {
    return await factoryContract.deployedMedicalCards(userAddress);
  }

  public async getDeployedClinic(userAddress: string) {
    return await factoryContract.deployedClinics(userAddress);
  }

  public async saveContractAddress(userID: string): Promise<void> {

    const didDocument = await this.didService.getDIDDocument(userID);
    if (!didDocument) {
        throw new Error('DID document not found');
    }
    if (didDocument.contract_address) {
        throw new Error('Contract address already saved');
    }
    
    const contractAddress = await this.getDeployedMedicalCard(didDocument.authentication.address);
    didDocument.contract_address = contractAddress;
    console.log(contractAddress);
    
    await didDocument.save();
    return contractAddress;
  }

  public async saveContractAddressClinic(clinicID: string): Promise<void> {
    const clinic = await Clinic.findOne({ _id: clinicID });
    if(!clinic) {
      throw new Error('Clinic not found');
    }
    if(!clinic.address) {
      throw new Error('Wallet address already saved');
    }
    if(clinic.contract_address) {
      throw new Error('Contract address already saved');
    }

    console.log(clinic);
    
    const contractAddress = await this.getDeployedClinic(clinic.address);
    console.log(contractAddress);
    
    clinic.contract_address = contractAddress;
    await clinic.save();
    return contractAddress;
  }
}

export default new FactoryService();

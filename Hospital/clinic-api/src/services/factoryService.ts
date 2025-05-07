import { ethers } from "ethers";
import dotenv from "dotenv";
import { redis } from "../config/Redis";
import { Clinic } from "../models/Clinic";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const factoryABI = [
  "function deployClinic(address clinicOwner) external returns (address)",
  "function deployedClinics(address) external view returns (address)"
];

const factoryContract = new ethers.Contract(
  process.env.FACTORY_CONTRACT_ADDRESS!,
  factoryABI,
  provider
);

export class FactoryService {

  public async createDeployClinicTx(userID: string) {
    const clinic = await Clinic.findOne({ _id: userID });
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
    const data = iface.encodeFunctionData("deployClinic", [clinic.address]);

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

    await redis.set(`tx:${userID}`, JSON.stringify(tx), "EX", 3600);
    
    return tx;
  }

  public async getDeployedClinic(userAddress: string) {
    return await factoryContract.deployedClinics(userAddress);
  }

  public async saveContractAddress(userID: string): Promise<void> {
    const clinic = await Clinic.findOne({ _id: userID });
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

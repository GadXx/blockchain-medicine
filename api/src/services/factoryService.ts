import { ethers } from "ethers";
import dotenv from "dotenv";
import { DidService } from "./didService";
import { redis } from "../config/Redis";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const factoryABI = [
  "function deployMedicalCard(string memory ownerDID) external returns (address)",
  "function deployClinic() external returns (address)",
  "function addClinicDeployer(address deployer) external",
  "function removeClinicDeployer(address deployer) external",
  "function deployedMedicalCards(address) external view returns (address)"
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

  public async createDeployClinicTx(userAddress: string) {
    const iface = new ethers.Interface(factoryABI);
    const data = iface.encodeFunctionData("deployClinic");

    const tx = {
      to: process.env.FACTORY_CONTRACT_ADDRESS,
      data,
      from: userAddress
    };

    return tx;
  }

  public async addClinicDeployerTx(userAddress: string, deployerAddress: string) {
    const iface = new ethers.Interface(factoryABI);
    const data = iface.encodeFunctionData("addClinicDeployer", [deployerAddress]);

    const tx = {
      to: process.env.FACTORY_CONTRACT_ADDRESS,
      data,
      from: userAddress
    };

    return tx;
  }

  public async removeClinicDeployerTx(userAddress: string, deployerAddress: string) {
    const iface = new ethers.Interface(factoryABI);
    const data = iface.encodeFunctionData("removeClinicDeployer", [deployerAddress]);

    const tx = {
      to: process.env.FACTORY_CONTRACT_ADDRESS,
      data,
      from: userAddress
    };

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
    await didDocument.save();
    return;
}
}

export default new FactoryService();

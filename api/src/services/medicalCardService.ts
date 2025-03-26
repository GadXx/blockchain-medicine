import { ethers } from "ethers";
import { DidService } from "./didService";
import { redis } from "../config/Redis";

const medicalCardABI = [
  "function grantAccess(address clinic, address clinicContract) external",
  "function revokeAccess(address clinic) external",
  "function addMedicalRecord(string ipfsHash) external",
  "function getMedicalRecords() external view returns (tuple(string ipfsHash, string addedByDID, uint256 timestamp)[] memory)"
]
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

export class MedicalCardService {
  private didService: DidService;

  constructor() {
    this.didService = new DidService();
  }

  public async grantAccessTx(userID: string, clinicAddress: string, clinicContractAddress: string) {
    const DIDDocument = await this.didService.getDIDDocument(userID);

    const iface = new ethers.Interface(medicalCardABI);
    const data = iface.encodeFunctionData("grantAccess", [clinicAddress, clinicContractAddress]);

    const tx = {
      to: process.env.MEDICAL_CARD_CONTRACT_ADDRESS,
      data,
      from: DIDDocument.authentication.address
    };
    await redis.set(`tx:${userID}`, JSON.stringify(tx), "EX", 3600);
    return tx;
  }

  public async revokeAccessTx(userID: string, clinicAddress: string) {
    const DIDDocument = (await this.didService.getDIDDocument(userID));

    const iface = new ethers.Interface(medicalCardABI);
    const data = iface.encodeFunctionData("revokeAccess", [clinicAddress]);

    const tx = {
      to: process.env.MEDICAL_CARD_CONTRACT_ADDRESS,
      data,
      from: DIDDocument.authentication.address
    };

    await redis.set(`tx:${userID}`, JSON.stringify(tx), "EX", 3600);
    return tx;
  }

  public async addMedicalRecordTx(userID: string, ipfsHash: string) {
    const DIDDocument = await this.didService.getDIDDocument(userID);

    const iface = new ethers.Interface(medicalCardABI);
    const data = iface.encodeFunctionData("addMedicalRecord", [ipfsHash]);

    const tx = {
      to: process.env.MEDICAL_CARD_CONTRACT_ADDRESS,
      data,
      from: DIDDocument.authentication.address
    };

    await redis.set(`tx:${userID}`, JSON.stringify(tx), "EX", 3600);
    return tx;
  } 

  public async getMedicalRecordsTx(userID: string, signature: string) {
    const DIDDocument = await this.didService.getDIDDocument(userID);

    const message = "Access Medical Records";
    const recoveredAddress = ethers.verifyMessage(message, signature);

    // Проверяем, что этот адрес действительно владеет медицинской картой
    if (recoveredAddress !== DIDDocument.authentication.address) {
        throw new Error("Unauthorized: Invalid signature");
    }

    const iface = new ethers.Interface(medicalCardABI);
    const data = iface.encodeFunctionData("getMedicalRecords");

    const result = await provider.call({
      to: DIDDocument.contract_address,
      data,
      from: recoveredAddress,
    });
    
    const decode = iface.decodeFunctionResult("getMedicalRecords", result);
    console.log(decode);
    return decode;
  }

}

export default new MedicalCardService();
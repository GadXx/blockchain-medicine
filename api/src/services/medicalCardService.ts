import { ethers } from "ethers";
import { DidService } from "./didService";
import { redis } from "../config/Redis";
import { Doctor } from "../models/Clinic";

const medicalCardABI = [
  "function grantAccess(address clinic, address clinicContract) external",
  "function revokeAccess(address clinic) external",
  "function addMedicalRecord(string ipfsHash) external",
  "function getMedicalRecords() external view returns (tuple(string ipfsHash, address addedDoctor, uint256 timestamp)[] memory)",
  "function getAuthorizedClinic(address clinic) external view returns (address)"
]
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

export class MedicalCardService {
  private didService: DidService;

  constructor() {
    this.didService = new DidService();
  }

  public async grantAccessTx(userID: string, clinicAddress: string, clinicContractAddress: string) {

    const DIDDocument = await this.didService.getDIDDocument(userID);
    if(!DIDDocument) throw new Error("DID document not found");
    

    const iface = new ethers.Interface(medicalCardABI);
    const data = iface.encodeFunctionData("grantAccess", [clinicAddress, clinicContractAddress]);

    const tx = {
      to: DIDDocument.contract_address,
      data,
      from: DIDDocument.authentication.address,
      chainId: 1337,
      gasLimit: ethers.toQuantity(5000000n),
      gasPrice: ethers.toQuantity(0n),
      maxFeePerGas: ethers.toQuantity(0n),
      maxPriorityFeePerGas: ethers.toQuantity(0n),
      nonce: await provider.getTransactionCount(DIDDocument.authentication.address, "latest")
    };
    await redis.set(`tx:${userID}`, JSON.stringify(tx), "EX", 3600);
    return tx;
  }

  public async checkAccessTx(userID: string, clinicAddress: string, clinicContractAddress: string, doctorAddress: string) {

    const DIDDocument = (await this.didService.getDIDDocument(userID));

    const iface = new ethers.Interface(medicalCardABI);
    const data = iface.encodeFunctionData("getAuthorizedClinic", [clinicAddress]);

    const checkResult = await provider.call({
      to: DIDDocument.contract_address,
      data,
      from: DIDDocument.authentication.address,
      chainId: 1337,
      gasLimit: ethers.toQuantity(5000000n),
      gasPrice: ethers.toQuantity(0n),
      maxFeePerGas: ethers.toQuantity(0n),
      maxPriorityFeePerGas: ethers.toQuantity(0n),
      nonce: await provider.getTransactionCount(DIDDocument.authentication.address, "latest")
    });
    console.log("🔍 Clinic contract in storage:", iface.decodeFunctionResult("getAuthorizedClinic", checkResult));

    const ifaceClinic = new ethers.Interface([
      "function isDoctorRegistered(address doctor) external view returns (bool)"
    ]);
    
    const dataClinic = ifaceClinic.encodeFunctionData("isDoctorRegistered", [doctorAddress]);
    
    const checkDoctor = await provider.call({
      to: clinicContractAddress, // адрес контракта клиники
      data: dataClinic,
      from: doctorAddress
    });
    
    console.log("🔍 Doctor registered in clinic:", ifaceClinic.decodeFunctionResult("isDoctorRegistered", checkDoctor));
  }

  public async revokeAccessTx(userID: string, clinicAddress: string) {

    const DIDDocument = (await this.didService.getDIDDocument(userID));

    const iface = new ethers.Interface(medicalCardABI);
    const data = iface.encodeFunctionData("revokeAccess", [clinicAddress]);

    const tx = {
      to: DIDDocument.contract_address,
      data,
      from: DIDDocument.authentication.address,
      chainId: 1337,
      gasLimit: ethers.toQuantity(5000000n),
      gasPrice: ethers.toQuantity(0n),
      maxFeePerGas: ethers.toQuantity(0n),
      maxPriorityFeePerGas: ethers.toQuantity(0n),
      nonce: await provider.getTransactionCount(DIDDocument.authentication.address, "latest")
    };

    await redis.set(`tx:${userID}`, JSON.stringify(tx), "EX", 3600);
    return tx;
  }

  public async addMedicalRecordTx(doctorID: string, patienID: string, ipfsHash: string) {

    const doctor = await Doctor.findOne({ _id: doctorID });
    if(!doctor || !doctor.address) {
      throw new Error('Doctor not found');
    }

    const didDocument = await this.didService.getDIDDocument(patienID);
    if (!didDocument) throw new Error("DID document not found");

    const iface = new ethers.Interface(medicalCardABI);
    const data = iface.encodeFunctionData("addMedicalRecord", [ipfsHash]);

    const tx = {
      to: didDocument.contract_address,
      data,
      from: doctor.address,
      chainId: 1337,
      gasLimit: ethers.toQuantity(5000000n),
      gasPrice: ethers.toQuantity(0n),
      maxFeePerGas: ethers.toQuantity(0n),
      maxPriorityFeePerGas: ethers.toQuantity(0n),
      nonce: await provider.getTransactionCount(doctor.address, "latest")
    };

    await redis.set(`tx:${doctorID}`, JSON.stringify(tx), "EX", 3600);
    return tx;
  } 

  public async getMedicalRecordsTx(userID: string, signature: string) {

    const DIDDocument = await this.didService.getDIDDocument(userID);

    const message = "Access Medical Records";
    const recoveredAddress = ethers.verifyMessage(message, signature);

    const iface = new ethers.Interface(medicalCardABI);
    const data = iface.encodeFunctionData("getMedicalRecords");

    const result = await provider.call({
      to: DIDDocument.contract_address,
      data,
      from: recoveredAddress
    });
    
    const decode = iface.decodeFunctionResult("getMedicalRecords", result);
    
    return JSON.parse(JSON.stringify(decode, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    ));
  }

}

export default new MedicalCardService();
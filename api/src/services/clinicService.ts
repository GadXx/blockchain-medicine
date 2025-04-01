import { hash, compare } from 'bcrypt';
import { Clinic, IClinic, Doctor, IDoctor } from '../models/Clinic';
import { generateToken } from '../utils/jwt';
import { FactoryService } from './factoryService';
import { ethers } from "ethers";
import { redis } from "../config/Redis";
import dotenv from "dotenv";

dotenv.config();

const clinicCardABI = [
  "function registerDoctor(address doctor) external"
]
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

export class ClinicService {

    private factoryService: FactoryService;

    constructor() {
        this.factoryService = new FactoryService();
    }
     
    public async registerClinic(login: string, password: string): Promise<IClinic> {
        const hashedPassword = await hash(password, 10);
        const clinic = new Clinic({ login, password: hashedPassword });
        await clinic.save();
        return clinic;
    }

    public async loginClinic(login: string, password: string): Promise<string | null> {
        const clinic = await Clinic.findOne({ login });
        if (!clinic) throw new Error('Clinic not found');
        const isPasswordValid = await compare(password, clinic.password);
        if (!isPasswordValid) throw new Error('Invalid password');
        const token = generateToken(clinic._id.toString());
        return token;
    }

    public async verifyClinic(userID: string) {
        const clinic = await Clinic.findOne({ _id: userID });
        if(!clinic) throw new Error('Clinic not found');
        // логика подтверждения
        clinic.verified = true;
        await clinic.save();
        return true;
    }

    public async registerWallet(userID: string, walletAddress: string, walletPublicKey: string) {
        const clinic = await Clinic.findOne({ _id: userID });
        if(!clinic) throw new Error('Clinic not found');
        clinic.address = walletAddress;
        clinic.publicKey = walletPublicKey;
        await clinic.save();
        return true;
    }

    public async saveContractAddress(userID: string) {
        const clinic = await Clinic.findOne({ _id: userID });
        
        if(!clinic) throw new Error('Clinic not found');
        if(!clinic.address) throw new Error('Wallet address already saved');

        const contractAddress = await this.factoryService.getDeployedClinic(clinic.address);
        clinic.contract_address = contractAddress;
        await clinic.save();
        return true;
    }

    public async registerDoctorTx(userID: string, doctorAddress: string) {
        
        const clinic = await Clinic.findOne({ _id: userID });
        if(!clinic) throw new Error('Clinic not found');
        if(!clinic.verified) throw new Error('Clinic not verified');
        if(!clinic.address) throw new Error('Wallet address already saved');
        if(!clinic.contract_address) throw new Error('Contract address already saved');

        const iface = new ethers.Interface(clinicCardABI);
        const data = iface.encodeFunctionData("registerDoctor", [doctorAddress]);
    
        const tx = {
            to: clinic.contract_address,
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

    public async getAllClinics(): Promise<IClinic[]> {
        return await Clinic.find();
    }
}
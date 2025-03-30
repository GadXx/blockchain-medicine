import { hash, compare } from 'bcrypt';
import { Clinic, IClinic } from '../models/Clinic';
import { generateToken } from '../utils/jwt';
import { FactoryService } from './factoryService';

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

    public async verifyClinic(clinicID: string) {
        const clinic = await Clinic.findOne({ _id: clinicID });
        if(!clinic) throw new Error('Clinic not found');
        // логика подтверждения
        clinic.verified = true;
        await clinic.save();
        return true;
    }

    public async registerWallet(clinicID: string, walletAddress: string, walletPublicKey: string) {
        const clinic = await Clinic.findOne({ _id: clinicID });
        if(!clinic) throw new Error('Clinic not found');
        clinic.address = walletAddress;
        clinic.publicKey = walletPublicKey;
        await clinic.save();
        return true;
    }

    public async saveContractAddress(clinicID: string) {
        const clinic = await Clinic.findOne({ _id: clinicID });
        
        if(!clinic) throw new Error('Clinic not found');
        if(!clinic.address) throw new Error('Wallet address already saved');

        const contractAddress = await this.factoryService.getDeployedClinic(clinic.address);
        clinic.contract_address = contractAddress;
        await clinic.save();
        return true;
    }
}
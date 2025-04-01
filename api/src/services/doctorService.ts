import { hash, compare } from 'bcrypt';
import { Doctor, IDoctor} from '../models/Clinic';
import { generateToken } from '../utils/jwt';

export class DoctorService {
    
    public async registerDoctor(login: string, password: string): Promise<IDoctor> {
        const hashedPassword = await hash(password, 10);
        const doctor = new Doctor({ login, password: hashedPassword });
        await doctor.save();
        return doctor;
    }

    public async loginDoctor(login: string, password: string): Promise<string> {
        const doctor = await Doctor.findOne({ login });
        if (!doctor) throw new Error('Doctor not found');

        const isPasswordValid = await compare(password, doctor.password);
        if (!isPasswordValid) throw new Error('Invalid password');

        const token = generateToken(doctor._id.toString());
        return token;
    }

    public async registerWallet(userID: string, walletAddress: string, walletPublicKey: string) {
        const clinic = await Doctor.findOne({ _id: userID });
        if(!clinic) throw new Error('Clinic not found');
        clinic.address = walletAddress;
        clinic.publicKey = walletPublicKey;
        await clinic.save();
        return true;
    }
}
import { generateToken } from '../utils/jwt';
import dotenv from 'dotenv';
import { User, IUser } from '../models/User';
import { Doctor, IDoctor, Clinic, IClinic } from '../models/Clinic';


dotenv.config();

export class AdminService {

    public async loginAdmin(login: string, password: string): Promise<string | null> {
              
        if(login !== process.env.ADMIN_LOGIN || password !== process.env.ADMIN_PASSWORD) {
            throw new Error('Invalid login or password');
        }
        const token = generateToken('admin')
        
        return token;
    }

    public async getAllUsers(): Promise<IUser[]> {
        return await User.find();
    }

    public async getAllDoctors(): Promise<IDoctor[]> {
        return await Doctor.find();
    }

    public async getAllClinics(): Promise<IClinic[]> {
        return await Clinic.find();
    }
}

export default new AdminService();
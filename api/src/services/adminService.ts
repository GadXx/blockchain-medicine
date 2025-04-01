import { generateToken } from '../utils/jwt';
import dotenv from 'dotenv';

dotenv.config();

export class AdminService {

    public async loginAdmin(login: string, password: string): Promise<string | null> {
              
        if(login !== process.env.ADMIN_LOGIN || password !== process.env.ADMIN_PASSWORD) {
            throw new Error('Invalid login or password');
        }
        const token = generateToken('admin')
        
        return token;
    }


}

export default new AdminService();
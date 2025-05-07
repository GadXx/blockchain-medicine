import { hash, compare } from 'bcrypt';
import { User, IUser } from '../models/User';
import { generateToken } from '../utils/jwt';

export class AuthService {

  public async registerUser(email: string, phone: string, password: string): Promise<IUser | null> {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] }) as IUser | null;
    if (existingUser) {
      return null; 
    }
    const hashedPassword = await hash(password, 10);
    const user = new User({ email, phone, password: hashedPassword });
    await user.save();
    return user;
  }

  public async loginUser(identifier: string, password: string): Promise<{ token: string, user: IUser }> {
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] }) as IUser | null;
    if (!user) throw new Error('User not found');

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new Error('Invalid password');

    const token = generateToken(user._id.toString());
    return { token: token, user: user };
  }

  public async verifycationUser(userID: string, code: string): Promise<IUser> {
    const user = await User.findById(userID) as IUser;
    if (!user) throw new Error('User not found');
    
    console.log(`Verification code: ${code}`);
    

    if (code != "777") {
      throw new Error('Invalid verification code');
    }

    user.verified = true;
    await user.save();
    return user;
  }
  
  public async getAllUsers(): Promise<IUser[]> {
    return await User.find();
  }
}

export default new AuthService();
import { hash, compare } from 'bcrypt';
import { User, IUser } from '../models/User';
import { generateToken } from '../utils/jwt';

export class UserService {

  public async register(email: string, phone: string, password: string): Promise<IUser> {
    const hashedPassword = await hash(password, 10);
    const user = new User({ email, phone, password: hashedPassword });
    console.log(`Registering user with email: ${email} and phone: ${phone}`);
    await user.save();
    return user;
  }

  public async login(identifier: string, password: string): Promise<{ token: string }> {
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] }) as IUser | null;
    if (!user) throw new Error('User not found');

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new Error('Invalid password');

    const token = generateToken(user._id.toString());
    return { token: token };
  }

  public async getMe(userID: string): Promise<IUser> {
    const user = await User.findById(userID) as IUser;
    if (!user) throw new Error('User not found');
    return user;
  }

  public async getUserByID(userID: string): Promise<IUser> {
    const user = await User.findById(userID) as IUser;
    if (!user) throw new Error('User not found');
    return user;
  }

  public async verifycationUser(userID: string): Promise<IUser> {
    const user = await User.findById(userID) as IUser;
    if (!user) throw new Error('User not found');
    // Логика верификации пользователя
    user.verified = true;
    await user.save();
    return user;
  }
  
}

export default new UserService();
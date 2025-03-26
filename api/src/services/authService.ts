import { hash, compare } from 'bcrypt';
import { User, IUser } from '../models/User';
import { generateToken } from '../utils/jwt';

export class AuthService {

  async registerUser(email: string, phone: string, password: string): Promise<IUser> {
    const hashedPassword = await hash(password, 10);
    const user = new User({ email, phone, password: hashedPassword });
    await user.save();
    return user;
  }

  async loginUser(identifier: string, password: string): Promise<string | null> {
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] }) as IUser | null;
    if (!user) {
      return null;
    }
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return null;
    }
    const token = generateToken(user._id.toString());
    return token;
  }

  async verifycationUser(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId) as IUser | null;
    if (!user) {
      return null;
    }
    // Логика верификации пользователя
    user.verified = true;
    await user.save();
    return user;
  }
}

export default new AuthService();
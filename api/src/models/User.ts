import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  phone: string;
  password: string;
  verified: boolean;
  did?: string;
  _id: string;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  did: { type: String, required: false }
});

const User = model<IUser>('User', userSchema);

export { User, IUser };

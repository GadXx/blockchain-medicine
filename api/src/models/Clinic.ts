import { Schema, model, Document } from 'mongoose';

interface IClinic extends Document {
  login: string;
  password: string;
  verified: boolean;
  address?: string;
  publicKey?: string;
  contract_address?: string;
  _id: string;
}

const clinicSchema = new Schema<IClinic>({
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  address: { type: String, required: false },
  publicKey: { type: String, required: false },
  contract_address: { type: String, required: false }
});

const Clinic = model<IClinic>('Clinic', clinicSchema);

export { Clinic, IClinic };

interface IDoctor extends Document {
  login: string;
  password: string;
  did?: string;
  address?: string,
  publicKey?: string
  _id: string;
}

const doctorSchema = new Schema<IDoctor>({
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  did: { type: String, required: false },
  address: { type: String, required: false },
  publicKey: { type: String, required: false }
});

const Doctor = model<IDoctor>('Doctor', doctorSchema);

export { Doctor, IDoctor };
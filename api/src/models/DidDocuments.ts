import { Schema, model, Document } from 'mongoose';

interface IDIDDocument extends Document {
  did: string;
  authentication: { 
    type: string; 
    address: string;
    publicKey: string
  };
  contract_address: string;
}

const didDocumentSchema = new Schema<IDIDDocument>({
  did: { type: String, required: true },
  authentication: {
    type: { type: String, required: true },
    address: { type: String, required: true },
    publicKey: { type: String, required: true }
  },
  contract_address: { type: String, required: false }
});

const DidDocument = model<IDIDDocument>('DidDocument', didDocumentSchema);

export { DidDocument, IDIDDocument };
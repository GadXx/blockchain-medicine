import { IDIDDocument, DidDocument } from "../models/DidDocuments";
import { generateWallet } from "../utils/wallet";   
import { generateDID, verifyDID } from "../utils/did";
import { User, IUser } from '../models/User';
import { ethers } from "ethers";
import { redis } from "../config/Redis";
import dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const DIDRegistryABI = [
  "function registerDID(string memory did) external"
];

export class DidService {

    public async registerDID(userID: string, mnemonic: string): Promise<string> {

        const user = await User.findById(userID) as IUser;
        if (!user) {
            throw new Error('User not found');
        }
        if (user.did) {
            throw new Error('DID already registered');
        }
        
        const userDID = generateDID();
        const wallet = generateWallet(mnemonic);
        const didDocumentData = {
            did: userDID,            
            authentication: { 
                type: 'EcdsaSecp256',
                address: wallet.address,
                publicKey: wallet.publicKey
            }
        };

        user.did = userDID;
        await user.save();
        
        const didDocument = new DidDocument(didDocumentData);
        await didDocument.save();
        return userDID;
    }
    
    public async getDID(userID: string): Promise<String> {        
        const user = await User.findById(userID) as IUser;
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.did) {
            throw new Error('DID not found');
        }
        return user.did;
    }

    public async getDIDDocument(userID: string): Promise<IDIDDocument> {
        const userDID = await this.getDID(userID);
        if (!userDID) {
            throw new Error('User not found');
        }
        const didDocument = await DidDocument.findOne({ did: userDID });
        if (!didDocument) {
            throw new Error('DID document not found');
        }
        return didDocument;
    }


    public async registerDIDinBlockchainTx(userID: string) {
        const didDocument = await this.getDIDDocument(userID);
        if (!didDocument) {
            throw new Error('DID document not found');
        }
        const iface = new ethers.Interface(DIDRegistryABI);
        const data = iface.encodeFunctionData("registerDID", [didDocument.did]);

        const tx = {
            to: process.env.DID_REGISTRY_ADDRESS,
            data,
            from: didDocument.authentication.address,
            chainId: 1337,
            gasLimit: ethers.toQuantity(5000000n),
            gasPrice: ethers.toQuantity(0n),
            maxFeePerGas: ethers.toQuantity(0n),
            maxPriorityFeePerGas: ethers.toQuantity(0n),
            nonce: await provider.getTransactionCount(didDocument.authentication.address, "latest")
        };

        await redis.set(`tx:${userID}`, JSON.stringify(tx), "EX", 3600);

        return tx;
    }

}


export default new DidService();
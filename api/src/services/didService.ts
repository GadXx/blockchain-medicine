import { IDIDDocument, DidDocument } from "../models/DidDocuments"; 
import { generateDID } from "../utils/did";
import { User, IUser } from '../models/User';
import { ethers } from "ethers";
import { redis } from "../config/Redis";
import dotenv from "dotenv";
import { log } from "console";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const DIDRegistryABI = [
  "function registerDID(string memory did) external"
];

export class DidService {

    public async registerDID(userID: string, walletAddress: string, walletPublicKey: string): Promise<string> {

        const user = await User.findById(userID) as IUser;
        if (user.did) throw new Error('DID already registered');
        
        const userDID = generateDID();
        const didDocumentData = {
            did: userDID,            
            authentication: { 
                type: 'EcdsaSecp256',
                address: walletAddress,
                publicKey: walletPublicKey
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

        if (!user) throw new Error('User not found')
        if (!user.did) throw new Error('DID not found');

        return user.did;
    }

    public async getDIDDocument(userID: string): Promise<IDIDDocument> {
        const userDID = await this.getDID(userID);
        if (!userDID) throw new Error('User not found');

        const didDocument = await DidDocument.findOne({ did: userDID });
        if (!didDocument) throw new Error('DID document not found');

        return didDocument;
    }


    public async registerDIDinBlockchainTx(userID: string, DID: string, walletAddress: string) {
        console.log(`Registering DID ${DID} for user ${userID} at address ${walletAddress}`);
        
        const iface = new ethers.Interface(DIDRegistryABI);
        const data = iface.encodeFunctionData("registerDID", [DID]);
        console.log(`Encoded data for transaction: ${data}`);
        
        const tx = {
            to: process.env.DID_REGISTRY_ADDRESS,
            data,
            from: walletAddress,
            chainId: 1337,
            gasLimit: ethers.toQuantity(5000000n),
            gasPrice: ethers.toQuantity(0n),
            maxFeePerGas: ethers.toQuantity(0n),
            maxPriorityFeePerGas: ethers.toQuantity(0n),
            nonce: await provider.getTransactionCount(walletAddress, "latest")
        };

        await redis.set(`tx:${userID}`, JSON.stringify(tx), "EX", 3600);

        return tx;
    }

}


export default new DidService();
import { ethers } from "ethers";
import dotenv from "dotenv";
import { redis } from "../config/Redis";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

export class TransactionService {

    public async sendSignedTransaction(userID: string, signedTx: string) {
        const data = await redis.get(`tx:${userID}`);
        if (!data) throw new Error("Transaction not found");
    
        const unsignedTx = typeof data === "string" ? JSON.parse(data) : data;
        const decodedTx = await ethers.Transaction.from(signedTx);
    
        console.log("Unsigned TX:", unsignedTx);
        console.log("Decoded Signed TX:", decodedTx.data);
    
        if (decodedTx.from !== unsignedTx.from || decodedTx.to !== unsignedTx.to || decodedTx.data !== unsignedTx.data) {
            throw new Error("Invalid transaction");
        }
        const errorReason = await provider.call({
            to: unsignedTx.to,
            from: unsignedTx.from,
            data: unsignedTx.data,
        });
        console.log("Call result:", errorReason);
        try {
            const txHash = await provider.send("eth_sendRawTransaction", [signedTx]);
            const receipt = await provider.waitForTransaction(txHash);
            console.log("Transaction Receipt:", receipt);
            await redis.del(`tx:${userID}`);
            return receipt;
        } catch (error) {
            console.error("Transaction failed:", error);
        }

    }
}

export default new TransactionService();


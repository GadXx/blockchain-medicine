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
    
        if (decodedTx.from !== unsignedTx.from ||
            decodedTx.to !== unsignedTx.to ||
            decodedTx.data !== unsignedTx.data) {
            throw new Error("Invalid transaction");
        }

        try {
            const txHash = await provider.send("eth_sendRawTransaction", [signedTx]);
            const receipt = await <any>provider.waitForTransaction(txHash);
            if (receipt.status !== 1) {
                throw new Error("Transaction execution failed");
            }

            await redis.del(`tx:${userID}`);
            return receipt;
        } catch (error) {
            throw error;
        }

    }
}

export default new TransactionService();


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
            console.log("✅ Transaction sent! Hash:", txHash);

            const receipt = await <any>provider.waitForTransaction(txHash);
            console.log("🔍 Transaction receipt:", receipt);

            if (receipt.status !== 1) {
                console.log("❌ Transaction failed!");
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


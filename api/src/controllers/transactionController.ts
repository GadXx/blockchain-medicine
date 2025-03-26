import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';

export class TransactionController {
    private transactionService: TransactionService; 

    constructor() {
        this.transactionService = new TransactionService();
    }

    public async sendSignedTransaction(req: Request, res: Response) {
        const { signedTx } = req.body;
        try {
            const result = await this.transactionService.sendSignedTransaction(req.userId!, signedTx);
            res.status(200).json({ success: true, transaction: result });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}


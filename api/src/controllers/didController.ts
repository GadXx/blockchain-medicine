import { Request, Response } from "express";
import { DidService } from "../services/didService";

export class DidController {
    private didService: DidService;

    constructor() {
        this.didService = new DidService();
    }

    public async registerDID(req: Request, res: Response): Promise<void> {
        try {
            const { encryptedMnemonic } = req.body;
            const result = await this.didService.registerDID(req.userId!, encryptedMnemonic);
            res.status(201).json({ success: true, did: result });
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    public async getDIDDocument(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.didService.getDIDDocument(req.userId!);
            res.status(200).json({ success: true, didDocument: result });
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    public async registerDIDinBlockchainTx(req: Request, res: Response): Promise<void> {
        try {
            const tx = await this.didService.registerDIDinBlockchainTx(req.userId!);
            res.json({ unsignedTransaction: tx });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
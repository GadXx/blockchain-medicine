import { Request, Response } from "express";
import { DidService } from "../services/didService";
import { isAdmin, isClinic, isDoctor, isPatient, isVerifiedPatient, isVerifPatientORClinic } from "../middleware/authDecorators";

export class DidController {
    private didService: DidService;

    constructor() {
        this.didService = new DidService();
    }

    // @isVerifiedPatient
    public async registerDID(req: Request, res: Response): Promise<void> {
        try {
            const { walletAddress, walletPublicKey } = req.body;
            const result = await this.didService.registerDID(req.userId!, walletAddress, walletPublicKey);
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

    // @isVerifiedPatient
    public async registerDIDinBlockchainTx(req: Request, res: Response): Promise<void> {
        try {
            const { DID, walletAddress } = req.body;
            console.log(`Registering DID in blockchain: ${DID} for user: ${req.userId} with wallet address: ${walletAddress}`);
            
            const tx = await this.didService.registerDIDinBlockchainTx(req.userId!, DID, walletAddress);
            res.status(200).json({ unsignedTransaction: tx });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
import { Request, Response } from "express";
import { MedicalCardService } from "../services/medicalCardService";

export class MedicalCardController {
    private medicalCardService: MedicalCardService;
    constructor() {
        this.medicalCardService = new MedicalCardService();
    }   

    public async grantAccessTx(req: Request, res: Response) {
        try {
            const tx = await this.medicalCardService.grantAccessTx(req.userId!, req.body.clinicAddress, req.body.clinicContractAddress);
            res.json({ unsignedTransaction: tx });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    public async revokeAccessTx(req: Request, res: Response) {
        try {
            const tx = await this.medicalCardService.revokeAccessTx(req.userId!, req.body.clinicAddress);
            res.json({ unsignedTransaction: tx });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }   
    }

    public async getMedicalRecords(req: Request, res: Response) {
        try {
            const { userId, signature } = req.body;
            const result = await this.medicalCardService.getMedicalRecords(userId, signature);
            res.json({ result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

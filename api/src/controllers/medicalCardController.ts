import { Request, Response } from "express";
import { MedicalCardService } from "../services/medicalCardService";
import { isAdmin, isClinic, isDoctor, isPatient, isVerifiedPatient } from "../middleware/authDecorators";

export class MedicalCardController {
    private medicalCardService: MedicalCardService;
    constructor() {
        this.medicalCardService = new MedicalCardService();
    }   

    @isVerifiedPatient
    public async grantAccessTx(req: Request, res: Response) {
        try {
            const tx = await this.medicalCardService.grantAccessTx(req.userId!, req.body.clinicAddress, req.body.clinicContractAddress);
            res.json({ unsignedTransaction: tx });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    public async checkAccessTx(req: Request, res: Response) {
        try {
            await this.medicalCardService.checkAccessTx(req.userId!, req.body.clinicAddress, req.body.clinicContractAddress, req.body.doctorAddress);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    @isVerifiedPatient
    public async revokeAccessTx(req: Request, res: Response) {
        try {
            const tx = await this.medicalCardService.revokeAccessTx(req.userId!, req.body.clinicAddress);
            res.json({ unsignedTransaction: tx });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }   
    }

    @isDoctor
    public async addMedicalRecordTx(req: Request, res: Response) {
        try {
            const tx = await this.medicalCardService.addMedicalRecordTx(req.userId!, req.body.userID, req.body.ipfsHash);
            res.json({ unsignedTransaction: tx });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    
    public async getMedicalRecordsTx(req: Request, res: Response) {
        try {
            const { userId, signature } = req.body;
            const result = await this.medicalCardService.getMedicalRecordsTx(userId, signature);
            res.json({ result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

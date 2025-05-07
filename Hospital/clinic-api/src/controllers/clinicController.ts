import { Request, Response } from "express";
import { ClinicService } from "../services/clinicService";
import { isAdmin, isVerifiedClinic } from "../middleware/authDecorators";

export class ClinicController {
    private clinicService: ClinicService;

    constructor() {
        this.clinicService = new ClinicService();
    }

    async registerClinic(req: Request, res: Response): Promise<void> {
        try {
            const { login, password } = req.body;
            const result = await this.clinicService.registerClinic(login, password);
            res.status(201).json({ success: true, clinic: result });
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async loginClinic(req: Request, res: Response): Promise<void> {
        try {
            const { identifier, password } = req.body;
            const result = await this.clinicService.loginClinic(identifier, password);
            res.status(200).json({ token: result });
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    @isAdmin
    async verifyClinic(req: Request, res: Response): Promise<void> {
        try {
            const { clinicID } = req.body;
            const result = await this.clinicService.verifyClinic(clinicID);
            res.status(200).json(result);
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    @isVerifiedClinic
    async registerWallet(req: Request, res: Response): Promise<void> {
        try {
            const { walletAddress, walletPublicKey } = req.body;
            const result = await this.clinicService.registerWallet(req.userId!, walletAddress, walletPublicKey);
            res.status(200).json(result);
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    @isVerifiedClinic
    async saveContractAddress(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.clinicService.saveContractAddress(req.userId!);
            res.status(200).json(result);
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAllClinics(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.clinicService.getAllClinics();
            res.status(200).json(result);
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    @isVerifiedClinic
    async registerDoctorTx(req: Request, res: Response): Promise<void> {
        try {
            const tx = await this.clinicService.registerDoctorTx(req.userId!, req.body.doctorAddress);
            res.json({ unsignedTransaction: tx });
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
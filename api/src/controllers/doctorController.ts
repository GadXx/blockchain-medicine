import { Request, Response } from "express";
import { DoctorService } from "../services/doctorService";
import { isVerifiedClinic } from "../middleware/authDecorators";

export class DoctorController {

    private doctorService: DoctorService;

    constructor() {
        this.doctorService = new DoctorService();
    }

    @isVerifiedClinic
    public async registerDoctor(req: Request, res: Response): Promise<void> {
        try {
            const { login, password } = req.body;
            const result = await this.doctorService.registerDoctor(login, password);
            res.status(201).json({ success: true, doctor: result });
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    public async loginDoctor(req: Request, res: Response): Promise<void> {
        try {
            const { identifier, password } = req.body;
            const result = await this.doctorService.loginDoctor(identifier, password);
            res.status(200).json({ token: result });
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }   
    }

    public async getDoctor(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.doctorService.getDoctor(req.userId!);
            res.status(200).json(result);
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    public async registerWallet(req: Request, res: Response): Promise<void> {
        try {
            const { walletAddress, walletPublicKey } = req.body;
            const result = await this.doctorService.registerWallet(req.userId!, walletAddress, walletPublicKey);
            res.status(200).json(result);
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
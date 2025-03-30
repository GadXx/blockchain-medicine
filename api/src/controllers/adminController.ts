import { Request, Response } from "express";
import { AdminService } from "../services/adminService";
import { isAdmin } from "../middleware/authDecorators";

export class AdminController {
    private adminService: AdminService;
    constructor() {
        this.adminService = new AdminService();
    }
    
    public async loginAdmin(req: Request, res: Response): Promise<void> {
        try {
            const { identifier, password } = req.body;
    
            const result = await this.adminService.loginAdmin(identifier, password);
            
            if (result) {
                console.log(result);
                res.status(200).json({ token: result });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }    
    }

    @isAdmin
    public async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.adminService.getAllUsers();
            res.status(200).json(result);
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    @isAdmin
    public async getAllClinics(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.adminService.getAllClinics();
            res.status(200).json(result);
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    @isAdmin
    public async getAllDoctors(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.adminService.getAllDoctors();
            res.status(200).json(result);
        }
        catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

}
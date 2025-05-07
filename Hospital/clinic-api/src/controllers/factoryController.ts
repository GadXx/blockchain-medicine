import { Request, Response } from "express";
import { FactoryService } from "../services/factoryService";
import { isVerifiedClinic } from "../middleware/authDecorators";

export class FactoryController {
  private factoryService: FactoryService;

  constructor() {
    this.factoryService = new FactoryService();
  }
  
  @isVerifiedClinic
  public async createDeployClinicTx(req: Request, res: Response): Promise<void> {
    try {
      const tx = await this.factoryService.createDeployClinicTx(req.userId!);
      res.json({ unsignedTransaction: tx });
    } catch (error) {
      console.error("Error creating deploy clinic transaction:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  @isVerifiedClinic
  public async saveContractAddress(req: Request, res: Response): Promise<void> {
    try {
        const result = await this.factoryService.saveContractAddress(req.userId!);
        res.status(200).json({ success: true, contract_address: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new FactoryController();

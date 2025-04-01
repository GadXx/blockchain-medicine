import { Request, Response } from "express";
import { FactoryService } from "../services/factoryService";
import { isAdmin, isClinic, isDoctor, isPatient, isVerifiedPatient, isVerifiedClinic } from "../middleware/authDecorators";

export class FactoryController {
  private factoryService: FactoryService;

  constructor() {
    this.factoryService = new FactoryService();
  }

  @isVerifiedPatient
  public async createDeployMedicalCardTx(req: Request, res: Response): Promise<void> {
    try {
      const tx = await this.factoryService.createDeployMedicalCardTx(req.userId!);
      res.json({ unsignedTransaction: tx });
    } catch (error) {
      console.error("Error creating deploy medical card transaction:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
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

  @isAdmin
  public async addClinicDeployerTx(req: Request, res: Response): Promise<void> {
    try {
      const { clinicID } = req.body;

      if (!clinicID) {
        res.status(400).json({ error: "Deployer address are required" });
        return;
      } 

      const tx = await this.factoryService.addClinicDeployerTx(req.userId!, clinicID);
      res.json({ unsignedTransaction: tx });
    } catch (error) {
      console.error("Error adding clinic deployer:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  @isAdmin
  public async removeClinicDeployerTx(req: Request, res: Response): Promise<void> {
    try {
      const { clinicID } = req.body;

      if (!clinicID) {
        res.status(400).json({ error: "Deployer address are required" });
        return;
      } 

      const tx = await this.factoryService.removeClinicDeployerTx(req.userId!, clinicID);
      res.json({ unsignedTransaction: tx });
    } catch (error) {
      console.error("Error removing clinic deployer:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  @isVerifiedPatient
  public async saveContractAddressPatient(req: Request, res: Response): Promise<void> {
    try {
        await this.factoryService.saveContractAddressPatient(req.userId!);
        res.status(200).json({ success: true, message: "Contract address saved successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
  }

  @isVerifiedClinic
  public async saveContractAddressClinic(req: Request, res: Response): Promise<void> {
    try {
        const result = await this.factoryService.saveContractAddressClinic(req.userId!);
        res.status(200).json({ success: true, contract_address: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new FactoryController();

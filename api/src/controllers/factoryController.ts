import { Request, Response } from "express";
import { FactoryService } from "../services/factoryService";

export class FactoryController {
  private factoryService: FactoryService;

  constructor() {
    this.factoryService = new FactoryService();
  }

  public async createDeployMedicalCardTx(req: Request, res: Response): Promise<void> {
    try {
      const tx = await this.factoryService.createDeployMedicalCardTx(req.userId!);
      res.json({ unsignedTransaction: tx });
    } catch (error) {
      console.error("Error creating deploy medical card transaction:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async createDeployClinicTx(req: Request, res: Response): Promise<void> {
    try {
      const { userAddress } = req.body;

      if (!userAddress) {
        res.status(400).json({ error: "User address is required" });
        return;
      } 

      const tx = await this.factoryService.createDeployClinicTx(userAddress);
      res.json({ unsignedTransaction: tx });
    } catch (error) {
      console.error("Error creating deploy clinic transaction:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async addClinicDeployer(req: Request, res: Response): Promise<void> {
    try {
      const { userAddress, deployerAddress } = req.body;

      if (!userAddress || !deployerAddress) {
        res.status(400).json({ error: "User address and deployer address are required" });
        return;
      }

      const tx = await this.factoryService.addClinicDeployerTx(userAddress, deployerAddress);
      res.json({ unsignedTransaction: tx });
    } catch (error) {
      console.error("Error adding clinic deployer:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async removeClinicDeployer(req: Request, res: Response): Promise<void> {
    try {
      const { userAddress, deployerAddress } = req.body;

      if (!userAddress || !deployerAddress) {
        res.status(400).json({ error: "User address and deployer address are required" });
        return;
      } 

      const tx = await this.factoryService.removeClinicDeployerTx(userAddress, deployerAddress);
      res.json({ unsignedTransaction: tx });
    } catch (error) {
      console.error("Error removing clinic deployer:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async saveContractAddress(req: Request, res: Response): Promise<void> {
    try {
        await this.factoryService.saveContractAddress(req.userId!);
        res.status(200).json({ success: true, message: "Contract address saved successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
}

export default new FactoryController();

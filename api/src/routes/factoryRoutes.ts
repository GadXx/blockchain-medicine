import express from "express";
import { FactoryController } from "../controllers/factoryController";
import { authMiddleware } from '../authMiddleware';

const router = express.Router();
router.use(authMiddleware);

const factoryController = new FactoryController();

router.post("/deploy-medical-card", (req, res) => factoryController.createDeployMedicalCardTx(req, res));
router.post("/deploy-clinic", (req, res) => factoryController.createDeployClinicTx(req, res));
router.post("/add-clinic-deployer", (req, res) => factoryController.addClinicDeployer(req, res));
router.post("/remove-clinic-deployer", (req, res) => factoryController.removeClinicDeployer(req, res));
router.post("/save-contract-address", (req, res) => factoryController.saveContractAddress(req, res));

export default router;

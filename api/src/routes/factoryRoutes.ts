import express from "express";
import { FactoryController } from "../controllers/factoryController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();
router.use(authMiddleware);

const factoryController = new FactoryController();

router.post("/deploy-medical-card", (req, res) => factoryController.createDeployMedicalCardTx(req, res));
router.post("/deploy-clinic", (req, res) => factoryController.createDeployClinicTx(req, res));
router.post("/add-clinic-deployer", (req, res) => factoryController.addClinicDeployerTx(req, res));
router.post("/remove-clinic-deployer", (req, res) => factoryController.removeClinicDeployerTx(req, res));
router.post("/save-contract-address-patient", (req, res) => factoryController.saveContractAddressPatient(req, res));
router.post("/save-contract-address-clinic", (req, res) => factoryController.saveContractAddressClinic(req, res));

export default router;
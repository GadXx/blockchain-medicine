import express from "express";
import { FactoryController } from "../controllers/factoryController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();
router.use(authMiddleware);

const factoryController = new FactoryController();

router.post("/deploy-clinic", (req, res) => factoryController.createDeployClinicTx(req, res));
router.post("/save-contract-address", (req, res) => factoryController.saveContractAddress(req, res));

export default router;

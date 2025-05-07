import express from "express";
import { FactoryController } from "../controllers/factoryController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();
router.use(authMiddleware);

const factoryController = new FactoryController();

router.post("/deploy", (req, res) => factoryController.createDeployMedicalCardTx(req, res));
router.put("/save-contract-address", (req, res) => factoryController.saveContractAddress(req, res));

export default router;

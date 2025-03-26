import { Router } from 'express';
import { Request, Response } from "express";
import { MedicalCardController } from "../controllers/medicalCardController";

import { authMiddleware } from '../authMiddleware';

const router = Router();
router.use(authMiddleware);

const medicalCardController = new MedicalCardController();

router.post("/grant-access", (req: Request, res: Response) => medicalCardController.grantAccessTx(req, res));
router.post("/revoke-access", (req: Request, res: Response) => medicalCardController.revokeAccessTx(req, res));
router.post("/add-medical-record", (req: Request, res: Response) => medicalCardController.addMedicalRecordTx(req, res));
router.post("/get-medical-records", (req: Request, res: Response) => medicalCardController.getMedicalRecordsTx(req, res));

export default router;
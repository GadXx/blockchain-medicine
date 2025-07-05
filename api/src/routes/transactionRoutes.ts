import { Router } from 'express';
import { Request, Response } from "express";
import { TransactionController } from "../controllers/transactionController";

import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

const transactionController = new TransactionController();

router.post("/send", (req: Request, res: Response) => transactionController.sendSignedTransaction(req, res));

export default router;
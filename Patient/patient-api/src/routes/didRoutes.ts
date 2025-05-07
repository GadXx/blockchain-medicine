import { Router } from 'express';
import { DidController } from '../controllers/didController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

const didController = new DidController();

router.post("/register", (req, res) => didController.registerDID(req, res));
router.get("/get", (req, res) => didController.getDIDDocument(req, res));
router.post("/register-in-blockchain", (req, res) => didController.registerDIDinBlockchainTx(req, res));

export default router;
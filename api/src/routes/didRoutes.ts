import { Router } from 'express';
import { DidController } from '../controllers/didController';
import { authMiddleware } from '../authMiddleware';

const router = Router();
router.use(authMiddleware);

const didController = new DidController();

router.post("/register-did", (req, res) => didController.registerDID(req, res));
router.get("/get-did-document", (req, res) => didController.getDIDDocument(req, res));
router.post("/register-did-in-blockchain", (req, res) => didController.registerDIDinBlockchainTx(req, res));

export default router;
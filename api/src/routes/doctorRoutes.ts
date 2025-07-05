import { Router } from 'express';
import { DoctorController } from '../controllers/doctorController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const doctorController = new DoctorController();

router.use(authMiddleware);

router.post('/register', (req, res) => doctorController.registerDoctor(req, res));
router.post('/login', (req, res) => doctorController.loginDoctor(req, res));
router.post('/wallet', (req, res) => doctorController.registerWallet(req, res));

export default router;
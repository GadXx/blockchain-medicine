import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const authController = new AuthController();

router.post('/register', (req, res) => authController.registerUser(req, res));
router.post('/login', (req, res) => authController.loginUser(req, res));

router.use(authMiddleware);

router.put('/verify', (req, res) => authController.verifycationUser(req, res));

export default router;
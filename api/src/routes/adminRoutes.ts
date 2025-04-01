import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const adminController = new AdminController();

router.post('/login', (req, res) => adminController.loginAdmin(req, res));

router.use(authMiddleware);

export default router;
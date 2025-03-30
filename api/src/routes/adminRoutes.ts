import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const adminController = new AdminController();

router.post('/login', (req, res) => adminController.loginAdmin(req, res));

router.use(authMiddleware);

router.get('/get-all-users', (req, res) => adminController.getAllUsers(req, res));
router.get('/get-all-clinics', (req, res) => adminController.getAllClinics(req, res));
router.get('/get-all-doctors', (req, res) => adminController.getAllDoctors(req, res));

export default router;
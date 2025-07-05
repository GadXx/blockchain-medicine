import { Router } from 'express';
import { UserController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const userController = new UserController();

router.post('/register', (req, res) => userController.register(req, res));
router.post('/login', (req, res) => userController.login(req, res));

router.use(authMiddleware);

router.get('/me', (req, res) => userController.getMe(req, res));
router.get('/user/{id}', (req, res) => userController.getUser(req, res));
router.put('/verify', (req, res) => userController.verifycationUser(req, res));

export default router;
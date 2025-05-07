import { Router } from 'express';
import { ClinicController } from '../controllers/clinicController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const clinicController = new ClinicController();

router.post('/register', (req, res) => clinicController.registerClinic(req, res));
router.post('/login', (req, res) => clinicController.loginClinic(req, res));

router.use(authMiddleware);

router.put('/verify', (req, res) => clinicController.verifyClinic(req, res));
router.post('/register-wallet', (req, res) => clinicController.registerWallet(req, res));
router.post('/save-contract-address', (req, res) => clinicController.saveContractAddress(req, res));
router.post('/register-doctor', (req, res) => clinicController.registerDoctorTx(req, res));

router.get('/all-clinics', (req, res) => clinicController.getAllClinics(req, res));

export default router;
import { Router } from 'express';
import { getPendingVerifications, getVerifiedEmployees, updateVerificationStatus, deleteEmployee, updateEmployee } from '../controllers/admin';
import { verifyToken, isAdmin } from '../middleware/auth';

const router = Router();

router.use(verifyToken as any, isAdmin as any);

router.get('/pending', getPendingVerifications);
router.get('/verified', getVerifiedEmployees);
router.patch('/verification/:id', updateVerificationStatus);
router.delete('/employee/:id', deleteEmployee);
router.put('/employee/:id', updateEmployee);

export default router;

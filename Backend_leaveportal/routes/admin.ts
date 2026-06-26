import { Router } from 'express';
import { getPendingVerifications, getVerifiedEmployees, updateVerificationStatus, deleteEmployee, updateEmployee } from '../controllers/admin';

const router = Router();

router.get('/pending', getPendingVerifications);
router.get('/verified', getVerifiedEmployees);
router.patch('/verification/:id', updateVerificationStatus);
router.delete('/employee/:id', deleteEmployee);
router.put('/employee/:id', updateEmployee);

export default router;

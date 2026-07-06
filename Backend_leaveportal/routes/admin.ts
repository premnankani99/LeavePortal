import { Router } from 'express';
import { getPendingVerifications, getVerifiedEmployees, updateVerificationStatus, deleteEmployee, updateEmployee, grantCompOff, getCompOffHistory } from '../controllers/admin';
import { verifyToken } from '../middleware/auth';
import { hasPermission } from '../middleware/rbac';

const router = Router();

router.use(verifyToken as any);

router.get('/pending', hasPermission('employees:read') as any, getPendingVerifications);
router.get('/verified', hasPermission('employees:read') as any, getVerifiedEmployees);
router.patch('/verification/:id', hasPermission('employees:write') as any, updateVerificationStatus);
router.delete('/employee/:id', hasPermission('employees:write') as any, deleteEmployee);
router.put('/employee/:id', hasPermission('employees:write') as any, updateEmployee);

router.post('/comp-off/grant', hasPermission('employees:write') as any, grantCompOff as any);
router.get('/comp-off/history', hasPermission('employees:read') as any, getCompOffHistory as any);

export default router;

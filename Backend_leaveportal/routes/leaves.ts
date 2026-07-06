import { Router } from 'express';
import { applyLeave, getMyLeaves, getMyCompOffs, getAllLeaves, updateLeaveStatus, withdrawLeave, getLeavesByEmployee, applyLeaveOnBehalf, adjustUnpaidLeave, requestCompOff, getPendingCompOffRequests, actionCompOffRequest } from '../controllers/leaves';
import { verifyToken } from '../middleware/auth';
import { hasPermission } from '../middleware/rbac';

const router = Router();

router.post('/apply', verifyToken, applyLeave as any);
router.post('/admin/apply-on-behalf', verifyToken, hasPermission('leaves:write') as any, applyLeaveOnBehalf as any);
router.get('/my-leaves', verifyToken, getMyLeaves as any);
router.get('/my-comp-offs', verifyToken, getMyCompOffs as any);
router.post('/adjust-unpaid', verifyToken, adjustUnpaidLeave as any);
router.get('/all', verifyToken, hasPermission('leaves:read') as any, getAllLeaves as any);
router.get('/employee/:employeeId', verifyToken, hasPermission('leaves:read') as any, getLeavesByEmployee as any);
router.put('/status/:id', verifyToken, hasPermission('leaves:write') as any, updateLeaveStatus as any);
router.put('/withdraw/:id', verifyToken, withdrawLeave as any);

router.post('/compoff/request', verifyToken, requestCompOff as any);
router.get('/compoff/requests/pending', verifyToken, hasPermission('leaves:write') as any, getPendingCompOffRequests as any);
router.post('/compoff/requests/:id/action', verifyToken, hasPermission('leaves:write') as any, actionCompOffRequest as any);

export default router;

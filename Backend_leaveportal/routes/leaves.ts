import { Router } from 'express';
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, withdrawLeave } from '../controllers/leaves';
import { verifyToken, isAdmin } from '../middleware/auth';

const router = Router();

router.post('/apply', verifyToken, applyLeave as any);
router.get('/my-leaves', verifyToken, getMyLeaves as any);
router.get('/all', verifyToken, isAdmin, getAllLeaves as any);
router.put('/status/:id', verifyToken, isAdmin, updateLeaveStatus as any);
router.put('/withdraw/:id', verifyToken, withdrawLeave as any);

export default router;

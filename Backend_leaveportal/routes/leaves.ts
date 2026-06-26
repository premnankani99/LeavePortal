import { Router } from 'express';
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, withdrawLeave } from '../controllers/leaves';

const router = Router();

router.post('/apply', applyLeave);
router.get('/my-leaves/:employee_id', getMyLeaves);
router.get('/all', getAllLeaves);
router.put('/status/:id', updateLeaveStatus);
router.put('/withdraw/:id', withdrawLeave);

export default router;

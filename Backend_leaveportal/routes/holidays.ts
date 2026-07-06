import { Router } from 'express';
import { getHolidays, addHoliday, deleteHoliday } from '../controllers/holidays';
import { verifyToken } from '../middleware/auth';
import { hasPermission } from '../middleware/rbac';

const router = Router();

// Public route to get holidays (all employees need to know holidays for leave calendar)
router.get('/', getHolidays);

// Protected routes for Admins and HRs to manage holidays
router.post('/', verifyToken, hasPermission('holidays:write') as any, addHoliday as any);
router.delete('/:id', verifyToken, hasPermission('holidays:write') as any, deleteHoliday as any);

export default router;

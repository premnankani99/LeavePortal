import { Router } from 'express';
import { register, login, verifyOtp, forgotPassword, resetPassword, me } from '../controllers/auth';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/me', verifyToken as any, me);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;

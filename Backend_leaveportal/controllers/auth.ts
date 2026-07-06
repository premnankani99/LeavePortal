import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';
import { sendEmail } from '../utils/emailService';
import { getOtpEmailTemplate, getResetPasswordEmailTemplate } from '../utils/emailTemplates';
import { MESSAGES } from '../constants/strings';
import { NUMBERS } from '../constants/numbers';
import { HTTP_STATUS } from '../constants/httpCodes';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_leave_portal';

/**
 * Generates a 6-digit OTP string.
 * @returns {string} The generated OTP.
 */
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Handles existing user verification for registration.
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} True if registration can proceed, false if blocked.
 */
const handleExistingUserForRegister = async (email: string): Promise<boolean> => {
    const existingUser = await prisma.profiles.findUnique({ where: { email } });
    if (existingUser) {
        if (!existingUser.email_verified || existingUser.verification_status === 'rejected') {
            await prisma.leave_requests.deleteMany({ where: { employee_id: existingUser.id } });
            await prisma.profiles.delete({ where: { email } });
            return true;
        }
        return false;
    }
    return true;
};

const capitalizeName = (name: string): string => {
    if (!name) return name;
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Creates a new user with OTP.
 * @param {any} data - The user registration data.
 * @returns {Promise<any>} The created user.
 */
const createUserWithOtp = async (data: any): Promise<any> => {
    const hashedPassword = await bcrypt.hash(data.password, NUMBERS.BCRYPT_SALT_ROUNDS);
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + NUMBERS.OTP_EXPIRY_MINUTES * NUMBERS.MS_IN_MINUTE);

    const newUser = await prisma.profiles.create({
        data: {
            full_name: capitalizeName(data.full_name),
            email: data.email,
            password: hashedPassword,
            role: "employee",
            email_verified: false,
            otp_code: otpCode,
            otp_expires_at: otpExpiresAt
        }
    });
    
    // Log OTP to console for easier local testing
    console.log(`\n=========================================`);
    console.log(`🔐 OTP for ${data.email} is: ${otpCode}`);
    console.log(`=========================================\n`);
    
    return { newUser, otpCode };
};

/**
 * Registers a new employee.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
export const register = async (_req: Request, res: Response): Promise<void> => {
    try {
        const { full_name, password } = _req.body;
        const email = _req.body.email.toLowerCase();

        if (email.toLowerCase() === 'premnankani99@gmail.com') {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.ADMIN_REGISTRATION_NOT_ALLOWED });
            return;
        }

        const canProceed = await handleExistingUserForRegister(email);
        if (!canProceed) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.EMAIL_ALREADY_EXISTS });
            return;
        }

        const { newUser, otpCode } = await createUserWithOtp({ full_name, email, password });

        await sendEmail({
            to: email,
            subject: 'Verify Your Email - Leave Portal',
            text: `Your OTP is ${otpCode}`,
            html: getOtpEmailTemplate(full_name, otpCode)
        });

        res.status(HTTP_STATUS.CREATED).json({ 
            message: MESSAGES.REGISTRATION_SUCCESS, 
            userId: newUser.id,
            requireOtp: true 
        });
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.SERVER_ERROR });
    }
};

/**
 * Validates the OTP for a user.
 * @param {any} user - The user object.
 * @param {string} otp - The provided OTP.
 * @returns {string | null} Error message or null if valid.
 */
const validateUserForOtp = (user: any, otp: string): string | null => {
    if (!user) return MESSAGES.USER_NOT_FOUND;
    if (user.email_verified) return MESSAGES.EMAIL_VERIFIED;
    if (user.otp_code !== otp) return MESSAGES.INVALID_OTP;
    if (user.otp_expires_at && new Date() > user.otp_expires_at) return MESSAGES.INVALID_OTP;
    return null;
};

/**
 * Verifies the registration OTP.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
export const verifyOtp = async (_req: Request, res: Response): Promise<void> => {
    try {
        const { otp } = _req.body;
        const email = _req.body.email.toLowerCase();
        const user = await prisma.profiles.findUnique({ where: { email } });
        
        const errorMsg = validateUserForOtp(user, otp);
        if (errorMsg) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: errorMsg });
            return;
        }

        const updatedUser = await prisma.profiles.update({
            where: { email },
            data: { email_verified: true, otp_code: null, otp_expires_at: null }
        });

        const token = jwt.sign({ id: updatedUser.id, role: updatedUser.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(HTTP_STATUS.OK).json({ message: MESSAGES.EMAIL_VERIFIED, token, user: updatedUser });
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.SERVER_ERROR });
    }
};

/**
 * Handles unverified user during login by sending a new OTP.
 * @param {any} user - The unverified user object.
 * @returns {Promise<void>}
 */
const handleUnverifiedLogin = async (user: any): Promise<void> => {
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + NUMBERS.OTP_EXPIRY_MINUTES * NUMBERS.MS_IN_MINUTE);
    
    await prisma.profiles.update({
        where: { email: user.email },
        data: { otp_code: otpCode, otp_expires_at: otpExpiresAt }
    });

    // Log OTP to console for easier local testing
    console.log(`\n=========================================`);
    console.log(`🔐 OTP for ${user.email} is: ${otpCode}`);
    console.log(`=========================================\n`);

    await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - Leave Portal',
        text: `Your OTP is ${otpCode}`,
        html: getOtpEmailTemplate(user.full_name, otpCode)
    });
};

/**
 * Authenticates a user.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
export const login = async (_req: Request, res: Response): Promise<void> => {
    try {
        const { password } = _req.body;
        const email = _req.body.email.toLowerCase();
        const user = await prisma.profiles.findUnique({ where: { email } });

        if (!user || !user.password) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Email not registered" });
            return;
        }

        if (!user.email_verified) {
            await handleUnverifiedLogin(user);
            res.status(HTTP_STATUS.FORBIDDEN).json({ error: MESSAGES.OTP_SENT, requireOtp: true });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.INVALID_CREDENTIALS });
            return;
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(HTTP_STATUS.OK).json({ message: MESSAGES.LOGIN_SUCCESS, token, user });
    } catch (_error) {
        console.error("Login Error:", _error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.SERVER_ERROR });
    }
};

/**
 * Generates an OTP for password reset.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
export const forgotPassword = async (_req: Request, res: Response): Promise<void> => {
    try {
        const email = _req.body.email.toLowerCase();
        const user = await prisma.profiles.findUnique({ where: { email } });

        if (!user) {
            res.status(HTTP_STATUS.OK).json({ message: MESSAGES.FORGOT_PASSWORD_EMAIL_SENT });
            return;
        }

        const resetOtp = generateOTP();
        const expiresAt = new Date(Date.now() + NUMBERS.OTP_EXPIRY_MINUTES * NUMBERS.MS_IN_MINUTE);

        await prisma.profiles.update({
            where: { email },
            data: { reset_token: resetOtp, reset_token_expires_at: expiresAt }
        });

        await sendEmail({
            to: email,
            subject: 'Password Reset Request',
            text: `Your OTP is ${resetOtp}`,
            html: getResetPasswordEmailTemplate(user.full_name, resetOtp)
        });

        res.status(HTTP_STATUS.OK).json({ message: MESSAGES.FORGOT_PASSWORD_EMAIL_SENT });
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.SERVER_ERROR });
    }
};

/**
 * Validates reset token.
 * @param {any} user - User object.
 * @param {string} otp - Provided OTP.
 * @returns {string | null} Error string or null.
 */
const validateResetToken = (user: any, otp: string): string | null => {
    if (!user) return MESSAGES.USER_NOT_FOUND;
    if (user.reset_token !== otp) return MESSAGES.INVALID_OTP;
    if (user.reset_token_expires_at && new Date() > user.reset_token_expires_at) return MESSAGES.INVALID_OTP;
    return null;
};

/**
 * Resets the user's password.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
export const resetPassword = async (_req: Request, res: Response): Promise<void> => {
    try {
        const { otp, newPassword } = _req.body;
        const email = _req.body.email.toLowerCase();
        const user = await prisma.profiles.findUnique({ where: { email } });

        const errorMsg = validateResetToken(user, otp);
        if (errorMsg) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: errorMsg });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, NUMBERS.BCRYPT_SALT_ROUNDS);

        await prisma.profiles.update({
            where: { email },
            data: { password: hashedPassword, reset_token: null, reset_token_expires_at: null }
        });

        res.status(HTTP_STATUS.OK).json({ message: MESSAGES.PASSWORD_RESET_SUCCESS });
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.SERVER_ERROR });
    }
};

/**
 * Gets the current user's profile.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
export const me = async (req: Request, res: Response): Promise<void> => {
    try {
        const userReq = req as any;
        const user = await prisma.profiles.findUnique({
            where: { id: userReq.user.id }
        });

        if (!user) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.USER_NOT_FOUND });
            return;
        }

        res.status(HTTP_STATUS.OK).json({ user });
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.SERVER_ERROR });
    }
};

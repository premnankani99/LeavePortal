import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';
import { sendEmail } from '../utils/emailService';
import { getOtpEmailTemplate, getResetPasswordEmailTemplate } from '../utils/emailTemplates';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_leave_portal';

// Helper to generate 6 digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { full_name, email, password } = req.body;

        const existingUser = await prisma.profiles.findUnique({ where: { email } });
        if (existingUser) {
            // If user exists but email is not verified, we can resend OTP or allow re-register
            if (!existingUser.email_verified) {
                // Delete unverified user to allow fresh registration
                await prisma.profiles.delete({ where: { email } });
            } else {
                res.status(400).json({ error: "Email is already registered" });
                return;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const newUser = await prisma.profiles.create({
            data: {
                full_name,
                email,
                password: hashedPassword,
                role: "employee",
                email_verified: false,
                otp_code: otpCode,
                otp_expires_at: otpExpiresAt
            }
        });

        // Send OTP Email
        await sendEmail({
            to: email,
            subject: 'Verify Your Email - Leave Portal',
            text: `Your OTP is ${otpCode}`,
            html: getOtpEmailTemplate(full_name, otpCode)
        });

        res.status(201).json({ 
            message: "Registration successful. Please verify your email.", 
            userId: newUser.id,
            requireOtp: true 
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Something went wrong during registration" });
    }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;

        const user = await prisma.profiles.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        if (user.email_verified) {
            res.status(400).json({ error: "Email is already verified" });
            return;
        }

        if (user.otp_code !== otp) {
            res.status(400).json({ error: "Invalid OTP" });
            return;
        }

        if (user.otp_expires_at && new Date() > user.otp_expires_at) {
            res.status(400).json({ error: "OTP has expired. Please register again or request a new OTP." });
            return;
        }

        // OTP is valid
        const updatedUser = await prisma.profiles.update({
            where: { email },
            data: {
                email_verified: true,
                otp_code: null,
                otp_expires_at: null
            }
        });

        // Create token for automatic login after verification
        const token = jwt.sign({ id: updatedUser.id, role: updatedUser.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: "Email verified successfully", token, user: updatedUser });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ error: "Something went wrong during verification" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.profiles.findUnique({ where: { email } });
        if (!user || !user.password) {
            res.status(404).json({ error: "User not found or invalid credentials" });
            return;
        }

        // Enforce email verification
        if (!user.email_verified) {
            // Resend OTP
            const otpCode = generateOTP();
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
            
            await prisma.profiles.update({
                where: { email },
                data: { otp_code: otpCode, otp_expires_at: otpExpiresAt }
            });

            await sendEmail({
                to: email,
                subject: 'Verify Your Email - Leave Portal',
                text: `Your OTP is ${otpCode}`,
                html: getOtpEmailTemplate(user.full_name, otpCode)
            });

            res.status(403).json({ error: "Email not verified. A new OTP has been sent to your email.", requireOtp: true });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: "Incorrect password" });
            return;
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Something went wrong during login" });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await prisma.profiles.findUnique({ where: { email } });
        if (!user) {
            // Do not reveal if email exists or not, just return success
            res.status(200).json({ message: "If your email is registered, you will receive an OTP shortly." });
            return;
        }

        const resetOtp = generateOTP();
        const resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await prisma.profiles.update({
            where: { email },
            data: { reset_token: resetOtp, reset_token_expires_at: resetOtpExpiresAt }
        });

        await sendEmail({
            to: email,
            subject: 'Password Reset Request - Leave Portal',
            text: `Your password reset OTP is ${resetOtp}`,
            html: getResetPasswordEmailTemplate(user.full_name, resetOtp)
        });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ error: "Failed to process forgot password request" });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await prisma.profiles.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        if (user.reset_token !== otp) {
            res.status(400).json({ error: "Invalid OTP" });
            return;
        }

        if (user.reset_token_expires_at && new Date() > user.reset_token_expires_at) {
            res.status(400).json({ error: "OTP has expired. Please request a new one." });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.profiles.update({
            where: { email },
            data: {
                password: hashedPassword,
                reset_token: null,
                reset_token_expires_at: null
            }
        });

        res.status(200).json({ message: "Password reset successfully. You can now login." });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ error: "Failed to reset password" });
    }
};

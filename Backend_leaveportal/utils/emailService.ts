import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import prisma from '../prismaClient';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export interface SendEmailOptions {
    to: string;
    cc?: string | string[];
    subject: string;
    text: string;
    html?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
    try {
        // Fetch all HR emails to always CC them
        const hrUsers = await prisma.profiles.findMany({
            where: { role: 'hr' },
            select: { email: true }
        });
        
        const hrEmails = hrUsers.map(hr => hr.email).filter(Boolean);
        
        // Construct the CC array based on existing options and new HR emails
        let ccArray: string[] = [];
        if (options.cc) {
            if (Array.isArray(options.cc)) {
                ccArray = [...options.cc];
            } else {
                ccArray = [options.cc];
            }
        }
        
        // Add HR emails (avoiding duplicates if any)
        hrEmails.forEach(email => {
            if (!ccArray.includes(email)) {
                ccArray.push(email);
            }
        });

        const mailOptions = {
            from: process.env.FROM_EMAIL || '"Leave Portal" <noreply@yourdomain.com>',
            to: options.to,
            cc: ccArray.length > 0 ? ccArray : undefined,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

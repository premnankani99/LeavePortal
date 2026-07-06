import express, { Request, Response } from 'express';
import cors from 'cors';
import { sendEmail } from './utils/emailService';
import authRoutes from './routes/auth';
import leaveRoutes from './routes/leaves';
import adminRoutes from './routes/admin';
import holidaysRoutes from './routes/holidays';
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

import { HTTP_STATUS } from './constants/httpCodes';

// Test API Route
app.get('/', (_req: Request, res: Response) => {
    res.send("Backend API is running in TypeScript!");
});

// Test Email API
app.get('/api/test-email', async (req: Request, res: Response) => {
    const receiverEmail = req.query.email as string || process.env.ADMIN_EMAIL;
    
    if (!receiverEmail) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No email provided." });
        return;
    }
    
    const success = await sendEmail({
        to: receiverEmail,
        subject: "SMTP Connection Test",
        text: "Congratulations! Your SMTP connection in the Leave Portal is working perfectly! 🎉"
    });

    if (success) {
        res.status(HTTP_STATUS.OK).json({ message: `Test email sent successfully to ${receiverEmail}! Please check your inbox.` });
    } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to send email." });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/holidays', holidaysRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

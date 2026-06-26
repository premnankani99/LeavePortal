import express, { Request, Response } from 'express';
import cors from 'cors';
import { sendEmail } from './utils/emailService';
import authRoutes from './routes/auth';
import leaveRoutes from './routes/leaves';
import adminRoutes from './routes/admin';
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test API Route
app.get('/', (req: Request, res: Response) => {
    res.send("Backend API is running in TypeScript!");
});

// Test Email API
app.get('/api/test-email', async (req: Request, res: Response) => {
    // You can customize the receiver by passing ?email=your@email.com in the URL
    // Otherwise it defaults to the ADMIN_EMAIL in .env
    const receiverEmail = req.query.email as string || process.env.ADMIN_EMAIL;
    
    if (!receiverEmail) {
        res.status(400).json({ error: "No email provided. Please add ?email=receiver@example.com to the URL or set ADMIN_EMAIL in .env" });
        return;
    }
    
    const success = await sendEmail({
        to: receiverEmail,
        subject: "SMTP Connection Test",
        text: "Congratulations! Your SMTP connection in the Leave Portal is working perfectly! 🎉"
    });

    if (success) {
        res.status(200).json({ message: `Test email sent successfully to ${receiverEmail}! Please check your inbox.` });
    } else {
        res.status(500).json({ error: "Failed to send email. Please check your terminal for errors and verify your .env credentials." });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

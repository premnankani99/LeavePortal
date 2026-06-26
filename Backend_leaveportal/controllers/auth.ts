import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_leave_portal';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { full_name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await prisma.profiles.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "Email is already registered" });
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user in database
        const newUser = await prisma.profiles.create({
            data: {
                full_name,
                email,
                password: hashedPassword,
                role: "employee", // default role
            }
        });

        // Create token
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ message: "User registered successfully", token, user: newUser });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Something went wrong during registration" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await prisma.profiles.findUnique({ where: { email } });
        if (!user || !user.password) {
            res.status(404).json({ error: "User not found or invalid credentials" });
            return;
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: "Incorrect password" });
            return;
        }

        // Create token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Something went wrong during login" });
    }
};

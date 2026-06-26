import { Request, Response } from 'express';
import prisma from '../prismaClient'; // Trigger TS re-check

export const getPendingVerifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const pending = await prisma.profiles.findMany({
            where: { 
                verification_status: 'pending',
                is_deleted: false 
            },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json(pending);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch pending verifications" });
    }
};

export const getVerifiedEmployees = async (req: Request, res: Response): Promise<void> => {
    try {
        const verified = await prisma.profiles.findMany({
            where: { 
                verification_status: 'approved', 
                role: 'employee',
                is_deleted: false 
            },
            orderBy: { full_name: 'asc' }
        });
        res.status(200).json(verified);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch verified employees" });
    }
};

export const updateVerificationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        const updatedProfile = await prisma.profiles.update({
            where: { id: String(id) },
            data: { 
                verification_status: status,
                is_active: status === 'approved' 
            }
        });

        // Removed Audit Log generation

        res.status(200).json({ message: "Verification status updated", profile: updatedProfile });
    } catch (error) {
        res.status(500).json({ error: "Failed to update verification status" });
    }
};

export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        await prisma.profiles.update({
            where: { id: String(id) },
            data: { is_deleted: true }
        });

        res.status(200).json({ message: "Employee soft-deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove employee" });
    }
};

export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, designation, role } = req.body;

        const updatedProfile = await prisma.profiles.update({
            where: { id: String(id) },
            data: {
                full_name,
                email,
                phone,
                designation,
                role
            }
        });

        res.status(200).json({ message: "Employee updated successfully", profile: updatedProfile });
    } catch (error) {
        res.status(500).json({ error: "Failed to update employee" });
    }
};

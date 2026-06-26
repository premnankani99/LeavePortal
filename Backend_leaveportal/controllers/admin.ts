import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { MESSAGES } from '../constants/strings';
import { HTTP_STATUS } from '../constants/httpCodes';

/**
 * Fetches all pending employee verification requests.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export const getPendingVerifications = async (_req: Request, res: Response): Promise<void> => {
    try {
        const pending = await prisma.profiles.findMany({
            where: { 
                verification_status: 'pending',
                is_deleted: false 
            },
            orderBy: { created_at: 'desc' }
        });
        res.status(HTTP_STATUS.OK).json(pending);
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
    }
};

/**
 * Fetches all verified employees.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export const getVerifiedEmployees = async (_req: Request, res: Response): Promise<void> => {
    try {
        const verified = await prisma.profiles.findMany({
            where: { 
                verification_status: 'approved', 
                role: 'employee',
                is_deleted: false 
            },
            orderBy: { full_name: 'asc' }
        });
        res.status(HTTP_STATUS.OK).json(verified);
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
    }
};

/**
 * Updates the verification status of an employee.
 * @param {Request} req - The Express request object containing status in body.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export const updateVerificationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const updatedProfile = await prisma.profiles.update({
            where: { id: String(id) },
            data: { 
                verification_status: status,
                is_active: status === 'approved' 
            }
        });

        res.status(HTTP_STATUS.OK).json({ message: MESSAGES.VERIFICATION_UPDATED, profile: updatedProfile });
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.UPDATE_ERROR });
    }
};

/**
 * Soft deletes an employee profile.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        await prisma.profiles.update({
            where: { id: String(id) },
            data: { is_deleted: true }
        });

        res.status(HTTP_STATUS.OK).json({ message: MESSAGES.EMPLOYEE_DELETED });
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.DELETE_ERROR });
    }
};

/**
 * Updates an employee's details.
 * @param {Request} req - The Express request object containing updated fields.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, designation, role } = req.body;

        const updatedProfile = await prisma.profiles.update({
            where: { id: String(id) },
            data: { full_name, email, phone, designation, role }
        });

        res.status(HTTP_STATUS.OK).json({ message: MESSAGES.EMPLOYEE_UPDATED, profile: updatedProfile });
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.UPDATE_ERROR });
    }
};

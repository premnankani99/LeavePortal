import { Request, Response } from 'express';
import { sendEmail } from '../utils/emailService';
import { getAllLeaves } from './leaves';
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
                email_verified: true,
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
        const { full_name, email, phone, designation, role, date_of_joining } = req.body;

        const updateData: any = { full_name, email, phone, designation, role };
        if (date_of_joining) {
            updateData.date_of_joining = new Date(date_of_joining);
        }

        const updatedProfile = await prisma.profiles.update({
            where: { id: String(id) },
            data: updateData
        });

        res.status(HTTP_STATUS.OK).json({ message: MESSAGES.EMPLOYEE_UPDATED, profile: updatedProfile });
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.UPDATE_ERROR });
    }
};

export const grantCompOff = async (req: any, res: Response): Promise<void> => {
  try {
    const { employeeId, daysGranted, reason } = req.body;
    
    if (!employeeId || !daysGranted || !reason) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (daysGranted <= 0) {
      res.status(400).json({ error: "Days granted must be positive" });
      return;
    }

    const adminId = req.user?.id;
    if (!adminId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const employee = await prisma.profiles.findUnique({
      where: { id: employeeId }
    });

    if (!employee || !employee.is_active || employee.is_deleted) {
      res.status(404).json({ error: "Employee not found or inactive" });
      return;
    }

    const updatedEmployee = await prisma.$transaction(async (tx) => {
      await tx.compOffGrant.create({
        data: {
          employeeId,
          daysGranted,
          reason,
          grantedBy: adminId
        }
      });

      return await tx.profiles.update({
        where: { id: employeeId },
        data: {
          available_leaves: { increment: daysGranted }
        }
      });
    });

    if (daysGranted > 0) {
      // autoUpgradeUnpaidLeaves removed
    }

    const finalProfile = await prisma.profiles.findUnique({ where: { id: employeeId } });
    if (!finalProfile) throw new Error("Profile not found after update");

    if (finalProfile.email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #7e57c2; margin-top: 0;">Comp-Off Granted</h2>
          <p style="font-size: 16px;">Hi <strong>${finalProfile.full_name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.5;">An Admin has granted you <strong style="color: #4ade80;">${daysGranted} day(s)</strong> of Comp-Off.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Your New Leave Balance:</strong> ${finalProfile.available_leaves} Days</p>
          </div>
          <p style="font-size: 14px; color: #64748b;">You can use this balance to apply for future Paid leaves.</p>
          <br/>
          <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">Thanks,<br/>Admin Team</p>
        </div>
      `;
      await sendEmail({
        to: finalProfile.email,
        subject: 'Comp-Off Granted',
        text: `You have been granted ${daysGranted} day(s) of Comp-Off for reason: ${reason}. Your new balance is ${finalProfile.available_leaves}.`,
        html: emailHtml
      }).catch(err => console.error('Failed to send comp-off email:', err));
    }

    res.json({
      message: "Comp-off granted successfully",
      newBalance: finalProfile.available_leaves
    });
  } catch (error) {
    console.error("Error granting comp off:", error);
    res.status(500).json({ error: "Failed to grant comp off" });
  }
};

export const getCompOffHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const history = await prisma.compOffGrant.findMany({
      include: {
        employee: {
          select: {
            full_name: true,
            email: true
          }
        }
      },
      orderBy: {
        grantedAt: 'desc'
      }
    });

    res.json(history);
  } catch (error) {
    console.error("Error fetching comp off history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

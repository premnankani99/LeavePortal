import { Response } from 'express';
import prisma from '../prismaClient';
import { sendEmail } from '../utils/emailService';
import { 
    leaveAppliedAdminTemplate, 
    leaveAppliedEmployeeTemplate, 
    leaveStatusUpdateTemplate, 
    leaveWithdrawalAdminTemplate 
} from '../utils/emailTemplates';
import { MESSAGES } from '../constants/strings';
import { NUMBERS } from '../constants/numbers';
import { HTTP_STATUS } from '../constants/httpCodes';
import { AuthRequest } from '../middleware/auth';

/**
 * Calculates total days between two dates.
 * @param {Date} start - Start date.
 * @param {Date} end - End date.
 * @returns {number} Total days.
 */
const calculateTotalDays = (start: Date, end: Date): number => {
    return Math.ceil((end.getTime() - start.getTime()) / NUMBERS.MS_IN_A_DAY) + 1;
};

/**
 * Checks if user is in probation.
 * @param {Date} joinedDate - Joined date.
 * @returns {boolean} True if in probation.
 */
const isInProbation = (joinedDate: Date): boolean => {
    const now = new Date();
    const diffYears = now.getFullYear() - joinedDate.getFullYear();
    const diffMonths = now.getMonth() - joinedDate.getMonth();
    return ((diffYears * NUMBERS.MONTHS_IN_YEAR) + diffMonths) < NUMBERS.PROBATION_MONTHS;
};

/**
 * Calculates leave type and paid/unpaid status.
 * @param {boolean} inProbation - Is user in probation.
 * @param {string} employeeId - Employee ID.
 * @param {number} totalDays - Total requested days.
 * @param {string} leaveType - Base leave type.
 * @param {Date} start - Start date.
 * @returns {Promise<string>} Final leave type string.
 */
const calculateLeaveType = async (
    inProbation: boolean, employeeId: string, totalDays: number, leaveType: string, start: Date
): Promise<string> => {
    if (inProbation) return `${leaveType} (Unpaid - Probation)`;
    const existingLeaves = await prisma.leave_requests.findMany({
        where: {
            employee_id: String(employeeId), status: { in: ['approved', 'pending'] },
            start_date: { 
                gte: new Date(start.getFullYear(), start.getMonth(), 1), 
                lt: new Date(start.getFullYear(), start.getMonth() + 1, 1) 
            }
        }
    });
    const daysTakenThisMonth = existingLeaves.reduce((acc, req) => acc + (req.total_days || 0), 0);
    const availablePaid = Math.max(0, NUMBERS.DEFAULT_PAID_LEAVES_PER_MONTH - daysTakenThisMonth);
    if (totalDays > availablePaid) {
        return availablePaid > 0 
            ? `${leaveType} (${availablePaid} Paid, ${totalDays - availablePaid} Unpaid LOP)` 
            : `${leaveType} (Unpaid - LOP)`;
    }
    return `${leaveType} (Paid)`;
};

/**
 * Sends notification emails for a new leave request.
 * @param {any} profile - The employee profile.
 * @param {number} totalDays - Requested days.
 * @param {Date} start - Start date.
 * @param {Date} end - End date.
 * @param {string} reason - Leave reason.
 * @returns {Promise<void>}
 */
const sendLeaveEmails = async (profile: any, totalDays: number, start: Date, end: Date, reason: string): Promise<void> => {
    if (profile.email) {
        await sendEmail({
            to: profile.email,
            subject: 'Leave Application Submitted',
            text: `Your leave for ${totalDays} day(s) is submitted.`,
            html: leaveAppliedEmployeeTemplate(profile.full_name, totalDays, start.toDateString(), end.toDateString(), reason)
        });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
        await sendEmail({
            to: adminEmail,
            subject: 'New Leave Request',
            text: `Employee ${profile.full_name} applied for ${totalDays} day(s) of leave.`,
            html: leaveAppliedAdminTemplate(profile.full_name, totalDays, start.toDateString(), end.toDateString(), reason)
        });
    }
};

/**
 * Applies for a new leave.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const applyLeave = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { leave_type, start_date, end_date, reason } = req.body;
        const employee_id = req.user?.id;
        if (!employee_id) throw new Error("No user ID");

        const start = new Date(start_date);
        const end = new Date(end_date);
        const total_days = calculateTotalDays(start, end);

        const profile = await prisma.profiles.findUnique({ where: { id: employee_id } });
        if (!profile) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.EMPLOYEE_NOT_FOUND });
            return;
        }

        const joinedDate = profile.date_of_joining ? new Date(profile.date_of_joining) : new Date(profile.created_at);
        const inProbation = isInProbation(joinedDate);
        const finalLeaveType = await calculateLeaveType(inProbation, employee_id, total_days, leave_type, start);

        const newLeave = await prisma.leave_requests.create({
            data: { employee_id, leave_type: finalLeaveType, start_date: start, end_date: end, total_days, reason, status: 'pending' }
        });

        await sendLeaveEmails(profile, total_days, start, end, reason);
        res.status(HTTP_STATUS.CREATED).json({ message: MESSAGES.LEAVE_APPLIED, leave: newLeave });
    } catch (_error) {
        console.error("Apply Leave Error:", _error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.SERVER_ERROR });
    }
};

/**
 * Fetches personal leaves.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const getMyLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const employee_id = req.user?.id;
        const leaves = await prisma.leave_requests.findMany({
            where: { employee_id: String(employee_id) },
            orderBy: { created_at: 'desc' }
        });
        res.status(HTTP_STATUS.OK).json(leaves);
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
    }
};

/**
 * Fetches all leaves for admin.
 * @param {AuthRequest} _req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const getAllLeaves = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const leaves = await prisma.leave_requests.findMany({
            include: { employee: true },
            orderBy: { created_at: 'desc' }
        });
        res.status(HTTP_STATUS.OK).json(leaves);
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
    }
};

/**
 * Computes withdrawal update data.
 * @param {any} leave - Leave object.
 * @param {string} status - New status.
 * @returns {any} Update data object.
 */
const computeWithdrawalUpdateData = (leave: any, status: string): any => {
    const updateData: any = { status };
    if (status === 'approved') {
        updateData.approved_at = new Date();
        if (leave.status === 'withdrawal_requested' && leave.withdrawn_dates) updateData.withdrawn_dates = null;
    } else if (status === 'rejected') {
        updateData.rejected_at = new Date();
    } else if (status === 'cancelled') {
        if (leave.withdrawn_dates) {
            let withdrawnArray: string[] = typeof leave.withdrawn_dates === 'string' ? JSON.parse(leave.withdrawn_dates) : leave.withdrawn_dates;
            if (withdrawnArray.length > 0 && withdrawnArray.length < leave.total_days) {
                updateData.total_days = Math.max(0, leave.total_days - withdrawnArray.length);
                updateData.status = 'approved';
            }
        } else {
            updateData.withdrawn_at = new Date();
        }
    }
    return updateData;
};

/**
 * Sends status update email.
 * @param {any} leave - The updated leave.
 * @param {string} status - The status.
 * @param {string} adminNote - Admin note.
 * @returns {Promise<void>}
 */
const sendStatusEmail = async (leave: any, status: string, adminNote: string): Promise<void> => {
    if (leave.employee?.email) {
        await sendEmail({
            to: leave.employee.email,
            subject: `Leave Request ${status.toUpperCase()}`,
            text: `Your leave has been ${status}.`,
            html: leaveStatusUpdateTemplate(
                leave.employee.full_name, 
                leave.start_date.toDateString(), 
                leave.end_date.toDateString(), 
                status, 
                adminNote || ''
            )
        });
    }
};

/**
 * Updates a leave status.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const updateLeaveStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body; 
        const leave = await prisma.leave_requests.findUnique({ where: { id: String(id) } });
        
        if (!leave) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.LEAVE_NOT_FOUND });
            return;
        }

        const updateData = computeWithdrawalUpdateData(leave, status);
        if (adminNote) updateData.admin_note = adminNote;

        const updatedLeave = await prisma.leave_requests.update({
            where: { id: String(id) }, data: updateData, include: { employee: true }
        });

        await sendStatusEmail(updatedLeave, status, adminNote);

        res.status(HTTP_STATUS.OK).json({ message: MESSAGES.LEAVE_STATUS_UPDATED, leave: updatedLeave });
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.UPDATE_ERROR });
    }
};

/**
 * Generates withdrawal message and update payload.
 * @param {any} leave - Leave object.
 * @param {any} datesToWithdraw - Array of dates to withdraw.
 * @returns {any} Payload with message and updateData.
 */
const handlePendingOrApprovedWithdrawal = (leave: any, datesToWithdraw: any): { message: string, updateData: any } => {
    let updateData: any = {};
    let message = "";
    if (datesToWithdraw && Array.isArray(datesToWithdraw) && datesToWithdraw.length > 0) updateData.withdrawn_dates = datesToWithdraw;

    if (leave.status === 'pending') {
        if (updateData.withdrawn_dates) {
            if (updateData.withdrawn_dates.length >= leave.total_days) {
                updateData.status = 'cancelled';
                updateData.withdrawn_at = new Date();
                updateData.withdrawn_dates = null;
                message = MESSAGES.LEAVE_CANCELLED;
            } else {
                // Direct partial withdraw on a pending request
                updateData.status = 'pending'; // Keep it pending, admin hasn't seen it yet
                updateData.total_days = Math.max(0, leave.total_days - updateData.withdrawn_dates.length);
                message = "Partial leave withdrawn instantly as it was still pending.";
            }
        } else {
            updateData.status = 'cancelled';
            updateData.withdrawn_at = new Date();
            message = MESSAGES.LEAVE_CANCELLED;
        }
    } else if (leave.status === 'approved') {
        updateData.status = 'withdrawal_requested';
        updateData.withdrawal_requested_at = new Date();
        message = updateData.withdrawn_dates ? MESSAGES.LEAVE_WITHDRAWN_PARTIAL : MESSAGES.LEAVE_WITHDRAWN_FULL;
    }
    return { message, updateData };
};

/**
 * Sends withdrawal email to admin.
 * @param {any} employee - Employee object.
 * @param {Date} start - Start date.
 * @param {Date} end - End date.
 * @param {string} message - Message.
 * @returns {Promise<void>}
 */
const sendWithdrawalEmail = async (employee: any, start: Date, end: Date, message: string): Promise<void> => {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && employee) {
        await sendEmail({
            to: adminEmail,
            subject: 'Leave Withdrawal Request',
            text: `Withdrawal request from ${employee.full_name}`,
            html: leaveWithdrawalAdminTemplate(employee.full_name, start.toDateString(), end.toDateString(), message)
        });
    }
};

/**
 * Initiates a withdrawal request.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const withdrawLeave = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const leave = await prisma.leave_requests.findUnique({ where: { id: String(id) } });

        if (!leave) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.LEAVE_NOT_FOUND });
            return;
        }

        if (leave.status !== 'pending' && leave.status !== 'approved') {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.CANNOT_WITHDRAW });
            return;
        }

        const { message, updateData } = handlePendingOrApprovedWithdrawal(leave, req.body.datesToWithdraw);

        const updatedLeave = await prisma.leave_requests.update({ 
            where: { id: String(id) }, 
            data: updateData, 
            include: { employee: true } 
        });
        
        await sendWithdrawalEmail(updatedLeave.employee, updatedLeave.start_date, updatedLeave.end_date, message);
        res.status(HTTP_STATUS.OK).json({ message, leave: updatedLeave });
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.SERVER_ERROR });
    }
};

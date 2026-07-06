import prisma from '../prismaClient';
import { sendEmail } from '../utils/emailService';
import { 
    leaveAppliedAdminTemplate, 
    leaveAppliedEmployeeTemplate, 
    leaveStatusUpdateTemplate, 
    leaveWithdrawalAdminTemplate 
} from '../utils/emailTemplates';
import { NUMBERS } from '../constants/numbers';
import { MESSAGES } from '../constants/strings';

export const calculateTotalDays = async (start: Date, end: Date): Promise<number> => {
    const holidays = await prisma.holidays.findMany({
        where: { date: { gte: start, lte: end } }
    });
    const holidayDateStrings = holidays.map(h => h.date.toISOString().split('T')[0]);

    let days = 0;
    const current = new Date(start);
    current.setUTCHours(0,0,0,0);
    const endUTC = new Date(end);
    endUTC.setUTCHours(0,0,0,0);

    while (current <= endUTC) {
        const dayOfWeek = current.getUTCDay();
        const dateStr = current.toISOString().split('T')[0];
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDateStrings.includes(dateStr)) days++;
        current.setUTCDate(current.getUTCDate() + 1);
    }
    return days;
};

export const isInProbation = (joinedDate: Date): boolean => {
    const now = new Date();
    const diffYears = now.getFullYear() - joinedDate.getFullYear();
    const diffMonths = now.getMonth() - joinedDate.getMonth();
    return ((diffYears * NUMBERS.MONTHS_IN_YEAR) + diffMonths) < NUMBERS.PROBATION_MONTHS;
};

export const calculateLeaveType = async (
    inProbation: boolean, employeeId: string, totalDays: number, leaveType: string, start: Date, availableLeaves: number = 0
): Promise<string> => {
    const availablePaid = availableLeaves;
    
    if (inProbation) {
        if (availablePaid >= totalDays) {
            return `${leaveType} (Paid)`;
        } else if (availablePaid > 0) {
            return `${leaveType} (${availablePaid} Paid, ${totalDays - availablePaid} Unpaid - Probation)`;
        } else {
            return `${leaveType} (Unpaid - Probation)`;
        }
    }

    if (totalDays > availablePaid) {
        return availablePaid > 0 
            ? `${leaveType} (${availablePaid} Paid, ${totalDays - availablePaid} Unpaid LOP)` 
            : `${leaveType} (Unpaid - LOP)`;
    }
    return `${leaveType} (Paid)`;
};

export const extractPaidDays = (leaveTypeStr: string, totalDays: number): number => {
    if (leaveTypeStr.includes('(Paid)')) return totalDays;
    const match = leaveTypeStr.match(/\((\d+(?:\.\d+)?)\s+Paid/);
    if (match) return parseFloat(match[1]);
    return 0;
};

export const computeWithdrawalUpdateData = (leave: any, status: string): any => {
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

export const sendLeaveEmails = async (profile: any, totalDays: number, start: Date, end: Date, reason: string): Promise<void> => {
    const durationText = totalDays === 1 ? '1 day' : `${totalDays} days`;
    if (profile.email) {
        await sendEmail({
            to: profile.email, subject: 'Leave Application Submitted', text: `Your leave for ${durationText} is submitted.`,
            html: leaveAppliedEmployeeTemplate(profile.full_name, durationText, start.toDateString(), end.toDateString(), reason)
        });
    }
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
        await sendEmail({
            to: adminEmail, subject: 'New Leave Request', text: `Employee ${profile.full_name} applied for ${durationText} of leave.`,
            html: leaveAppliedAdminTemplate(profile.full_name, durationText, start.toDateString(), end.toDateString(), reason)
        });
    }
};

export const sendStatusEmail = async (leave: any, status: string, adminNote: string): Promise<void> => {
    if (leave.employee?.email) {
        await sendEmail({
            to: leave.employee.email, subject: `Leave Request ${status.toUpperCase()}`, text: `Your leave has been ${status}.`,
            html: leaveStatusUpdateTemplate(leave.employee.full_name, leave.start_date.toDateString(), leave.end_date.toDateString(), status, adminNote || '')
        });
    }
};

export const handlePendingOrApprovedWithdrawal = (leave: any, datesToWithdraw: any): { message: string, updateData: any } => {
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
                updateData.status = 'pending';
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

export const sendWithdrawalEmail = async (employee: any, start: Date, end: Date, message: string): Promise<void> => {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && employee) {
        await sendEmail({
            to: adminEmail, subject: 'Leave Withdrawal Request', text: `Withdrawal request from ${employee.full_name}`,
            html: leaveWithdrawalAdminTemplate(employee.full_name, start.toDateString(), end.toDateString(), message)
        });
    }
};

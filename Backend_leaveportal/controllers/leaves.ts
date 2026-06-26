import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { sendEmail } from '../utils/emailService';
import { 
    leaveAppliedAdminTemplate, 
    leaveAppliedEmployeeTemplate, 
    leaveStatusUpdateTemplate, 
    leaveWithdrawalAdminTemplate 
} from '../utils/emailTemplates';

// 1. Employee: Nayi Chutti Apply Karna
export const applyLeave = async (req: Request, res: Response): Promise<void> => {
    try {
        const { employee_id, leave_type, start_date, end_date, reason } = req.body;
        
        // 1. Calculate total days requested
        const start = new Date(start_date);
        const end = new Date(end_date);
        const total_days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

        // 2. Fetch Employee Profile to check Probation Status
        const profile = await prisma.profiles.findUnique({
            where: { id: String(employee_id) }
        });

        if (!profile) {
            res.status(404).json({ error: "Employee not found" });
            return;
        }

        const joinedDate = profile.date_of_joining ? new Date(profile.date_of_joining) : new Date(profile.created_at);
        const now = new Date();
        const diffYears = now.getFullYear() - joinedDate.getFullYear();
        const diffMonths = now.getMonth() - joinedDate.getMonth();
        const monthsSinceJoining = (diffYears * 12) + diffMonths;
        const inProbation = monthsSinceJoining < 6;

        let finalLeaveType = leave_type;

        // 3. Determine if leave is Paid or Unpaid
        if (inProbation) {
            // All leaves during probation are Unpaid
            finalLeaveType = `${leave_type} (Unpaid - Probation)`;
        } else {
            // Enforce 1 Paid Leave per month
            const currentMonth = start.getMonth();
            const currentYear = start.getFullYear();

            // Fetch leaves already taken in this month
            const existingLeavesThisMonth = await prisma.leave_requests.findMany({
                where: {
                    employee_id: String(employee_id),
                    status: { in: ['approved', 'pending'] },
                    start_date: {
                        gte: new Date(currentYear, currentMonth, 1),
                        lt: new Date(currentYear, currentMonth + 1, 1)
                    }
                }
            });

            // Calculate days already taken this month
            const daysTakenThisMonth = existingLeavesThisMonth.reduce((acc, req) => acc + (req.total_days || 0), 0);
            
            // Available Paid is max 1 minus whatever they've taken
            const availablePaid = Math.max(0, 1 - daysTakenThisMonth);

            if (total_days > availablePaid) {
                // If they request more days than available paid quota
                const unpaidDays = total_days - availablePaid;
                if (availablePaid > 0) {
                    finalLeaveType = `${leave_type} (${availablePaid} Paid, ${unpaidDays} Unpaid LOP)`;
                } else {
                    finalLeaveType = `${leave_type} (Unpaid - LOP)`;
                }
            } else {
                finalLeaveType = `${leave_type} (Paid)`;
            }
        }

        // 4. Save to Database
        const newLeave = await prisma.leave_requests.create({
            data: {
                employee_id: String(employee_id),
                leave_type: finalLeaveType,
                start_date: start,
                end_date: end,
                total_days,
                reason,
                status: 'pending'
            }
        });

        // 5. Send Emails
        if (profile.email) {
            await sendEmail({
                to: profile.email,
                subject: 'Leave Application Submitted',
                text: `Dear ${profile.full_name}, your leave application for ${total_days} day(s) from ${start.toDateString()} to ${end.toDateString()} has been submitted.`,
                html: leaveAppliedEmployeeTemplate(profile.full_name, total_days, start.toDateString(), end.toDateString(), reason)
            });
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
            await sendEmail({
                to: adminEmail,
                subject: 'New Leave Request',
                text: `Employee ${profile.full_name} has applied for ${total_days} day(s) of leave from ${start.toDateString()} to ${end.toDateString()}.`,
                html: leaveAppliedAdminTemplate(profile.full_name, total_days, start.toDateString(), end.toDateString(), reason)
            });
        }

        res.status(201).json({ message: "Leave applied successfully", leave: newLeave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not apply for leave" });
    }
};

// 2. Employee: Apni Chuttiyan Dekhna
export const getMyLeaves = async (req: Request, res: Response): Promise<void> => {
    try {
        const { employee_id } = req.params;
        const leaves = await prisma.leave_requests.findMany({
            where: { employee_id: String(employee_id) },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json(leaves);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch leaves" });
    }
};

// 3. Admin: Sabki Chuttiyan Dekhna
export const getAllLeaves = async (req: Request, res: Response): Promise<void> => {
    try {
        const leaves = await prisma.leave_requests.findMany({
            include: { employee: true }, // Employee ka naam bhi sath me aayega
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json(leaves);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch all leaves" });
    }
};

// 4. Admin: Chutti Approve ya Reject karna
export const updateLeaveStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body; 
        
        const leave = await prisma.leave_requests.findUnique({ where: { id: String(id) } });
        if (!leave) {
            res.status(404).json({ error: "Leave not found" });
            return;
        }

        let updateData: any = { status };
        if (adminNote) {
            updateData.admin_note = adminNote;
        }

        if (status === 'approved') {
            updateData.approved_at = new Date();
            
            // If admin rejected a partial withdrawal request (meaning they forced the leave to stay fully approved)
            if (leave.status === 'withdrawal_requested' && (leave as any).withdrawn_dates) {
                updateData.withdrawn_dates = null; // Clear the partial request
            }
        } else if (status === 'rejected') {
            updateData.rejected_at = new Date();
        } else if (status === 'cancelled') {
            // Admin approved the withdrawal!
            if ((leave as any).withdrawn_dates) {
                // It was a partial withdrawal
                let withdrawnArray: string[] = [];
                const wd = (leave as any).withdrawn_dates;
                if (typeof wd === 'string') {
                    withdrawnArray = JSON.parse(wd);
                } else if (Array.isArray(wd)) {
                    withdrawnArray = wd as string[];
                }

                if (withdrawnArray.length > 0 && withdrawnArray.length < leave.total_days) {
                    // Reduce the total days
                    updateData.total_days = Math.max(0, leave.total_days - withdrawnArray.length);
                    // The leave itself is still valid for the remaining days, so status goes back to approved
                    updateData.status = 'approved';
                }
            } else {
                // Full withdrawal
                updateData.withdrawn_at = new Date();
            }
        }

        const updatedLeave = await prisma.leave_requests.update({
            where: { id: String(id) },
            data: updateData,
            include: { employee: true }
        });

        if (updatedLeave.employee?.email) {
            await sendEmail({
                to: updatedLeave.employee.email,
                subject: `Leave Request ${status.toUpperCase()}`,
                text: `Dear ${updatedLeave.employee.full_name}, your leave request from ${updatedLeave.start_date.toDateString()} to ${updatedLeave.end_date.toDateString()} has been ${status}.`,
                html: leaveStatusUpdateTemplate(updatedLeave.employee.full_name, updatedLeave.start_date.toDateString(), updatedLeave.end_date.toDateString(), status, adminNote || '')
            });
        }

        // Generate Audit Log
        const adminId = req.body.adminId || null; 
        await prisma.audit_logs.create({
            data: {
                actor_id: adminId,
                action: status === 'cancelled' ? 'LEAVE_WITHDRAWAL_APPROVED' : `LEAVE_${status.toUpperCase()}`,
                target_table: 'leave_requests',
                target_id: String(id)
            }
        });

        res.status(200).json({ message: `Leave ${status}`, leave: updatedLeave });
    } catch (error) {
        console.error("Error updating leave status:", error);
        res.status(500).json({ error: "Could not update leave status" });
    }
};

// 5. Employee: Withdraw Leave
export const withdrawLeave = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { datesToWithdraw } = req.body;
        
        const leave = await prisma.leave_requests.findUnique({ where: { id: String(id) } });
        if (!leave) {
            res.status(404).json({ error: "Leave not found" });
            return;
        }

        let updateData: any = {};
        let message = "";

        if (datesToWithdraw && Array.isArray(datesToWithdraw) && datesToWithdraw.length > 0) {
            updateData.withdrawn_dates = datesToWithdraw;
        }

        if (leave.status === 'pending') {
            if (updateData.withdrawn_dates) {
                // For pending, just update the withdrawn dates and keep it pending for admin to see
                // Or change status to withdrawal_requested? Let's just cancel it completely for pending if no dates,
                // But if they selected dates, let's treat it as a modification requested
                updateData.status = 'withdrawal_requested';
                updateData.withdrawal_requested_at = new Date();
                message = "Partial withdrawal requested";
            } else {
                updateData.status = 'cancelled';
                updateData.withdrawn_at = new Date();
                message = "Leave cancelled successfully";
            }
        } else if (leave.status === 'approved') {
            updateData.status = 'withdrawal_requested';
            updateData.withdrawal_requested_at = new Date();
            message = updateData.withdrawn_dates ? "Partial withdrawal request sent to Admin" : "Withdrawal request sent to Admin";
        } else {
            res.status(400).json({ error: "Cannot withdraw this leave" });
            return;
        }

        const updatedLeave = await prisma.leave_requests.update({
            where: { id: String(id) },
            data: updateData,
            include: { employee: true }
        });

        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail && updatedLeave.employee) {
            await sendEmail({
                to: adminEmail,
                subject: 'Leave Withdrawal Request',
                text: `Employee ${updatedLeave.employee.full_name} has requested to withdraw their leave from ${updatedLeave.start_date.toDateString()} to ${updatedLeave.end_date.toDateString()}.`,
                html: leaveWithdrawalAdminTemplate(updatedLeave.employee.full_name, updatedLeave.start_date.toDateString(), updatedLeave.end_date.toDateString(), message)
            });
        }

        res.status(200).json({ message, leave: updatedLeave });
    } catch (error) {
        res.status(500).json({ error: "Could not withdraw leave" });
    }
};


const fs = require('fs');

const path = 'c:\\projects\\LeavePortal\\Backend_leaveportal\\controllers\\leaves.ts';
let code = fs.readFileSync(path, 'utf8');

const brokenTarget = `/**
 * Sends withdrawal email to admin.
 * @param {any} employee - Employee object.
 * @param {Date} start - Start date.
};`;

const replacement = `/**
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
            text: \`Withdrawal request from \${employee.full_name}\`,
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

/**
 * Calculates total days.
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
};`;

if (code.includes(brokenTarget)) {
    code = code.replace(brokenTarget, replacement);
    fs.writeFileSync(path, code);
    console.log("Successfully restored the missing functions!");
} else {
    console.log("Could not find the broken target.");
}

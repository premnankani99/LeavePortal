import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'controllers', 'leaves.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Replace calculateTotalDays
const calculateTotalDaysStr = `const calculateTotalDays = async (start: Date, end: Date): Promise<number> => {
    const holidays = await prisma.holidays.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            }
        }
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
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDateStrings.includes(dateStr)) {
            days++;
        }
        current.setUTCDate(current.getUTCDate() + 1);
    }
    return days;
};`;

content = content.replace(/const calculateTotalDays =[\s\S]*?};/, calculateTotalDaysStr);

// 2. Fix applyLeave to use the new calculateTotalDays and handle half day
content = content.replace(
    /const total_days = calculateTotalDays\(start, end\);/g,
    `const { is_half_day } = req.body;\n        const total_days = is_half_day ? 0.5 : await calculateTotalDays(start, end);`
);

// 3. Add applyLeaveOnBehalf
const applyLeaveOnBehalfStr = `
export const applyLeaveOnBehalf = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { employee_id, leave_type, start_date, end_date, reason, is_half_day } = req.body;
        if (!employee_id) throw new Error("No employee ID provided");

        const start = new Date(start_date);
        const end = new Date(end_date);
        
        const total_days = is_half_day ? 0.5 : await calculateTotalDays(start, end);

        const profile = await prisma.profiles.findUnique({ where: { id: employee_id } });
        if (!profile) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.EMPLOYEE_NOT_FOUND });
            return;
        }

        const joinedDate = profile.date_of_joining ? new Date(profile.date_of_joining) : new Date(profile.created_at);
        const inProbation = isInProbation(joinedDate);
        const finalLeaveType = await calculateLeaveType(inProbation, employee_id, total_days, leave_type, start);

        const newLeave = await prisma.leave_requests.create({
            data: { employee_id, leave_type: finalLeaveType, start_date: start, end_date: end, total_days, reason, status: 'approved' }
        });

        res.status(HTTP_STATUS.CREATED).json({ message: MESSAGES.LEAVE_APPLIED, leave: newLeave });
    } catch (_error) {
        console.error("Apply Leave On Behalf Error:", _error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.SERVER_ERROR });
    }
};
`;
content = content.replace(/export const getMyLeaves/, applyLeaveOnBehalfStr + '\nexport const getMyLeaves');

// 4. Add Comp-Off endpoints and adjustUnpaidLeave
const compOffStr = `
export const adjustUnpaidLeave = async (req: AuthRequest, res: Response): Promise<void> => {
    res.status(HTTP_STATUS.OK).json({ message: "adjustUnpaidLeave unimplemented" });
};

export const getLeavesByEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { employeeId } = req.params;
        const leaves = await prisma.leave_requests.findMany({
            where: { employee_id: String(employeeId) },
            include: { employee: true },
            orderBy: { created_at: 'desc' }
        });
        res.status(HTTP_STATUS.OK).json(leaves);
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
    }
};

export const requestCompOff = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { start_date, end_date, total_days, reason } = req.body;
        const employee_id = req.user?.id;
        if (!employee_id) throw new Error("No user ID");

        const compOff = await prisma.compOffGrant.create({
            data: {
                employeeId: employee_id,
                grantedAt: new Date(),
                daysGranted: total_days,
                reason: reason,
                status: 'pending'
            }
        });
        res.status(HTTP_STATUS.CREATED).json({ message: "Comp-off requested successfully", compOff });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to request comp-off" });
    }
};

export const getPendingCompOffRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const requests = await prisma.compOffGrant.findMany({
            where: { status: 'pending' },
            include: { employee: true },
            orderBy: { grantedAt: 'desc' }
        });
        res.status(HTTP_STATUS.OK).json(requests);
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch requests" });
    }
};

export const actionCompOffRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;
        const admin_id = req.user?.id;

        const request = await prisma.compOffGrant.findUnique({ where: { id: String(id) } });
        if (!request) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Request not found" });
            return;
        }
        if (request.status !== 'pending') {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Request is already processed" });
            return;
        }

        await prisma.$transaction(async (tx) => {
            await tx.compOffGrant.update({
                where: { id: String(id) },
                data: { status, adminNote, grantedBy: admin_id }
            });
            if (status === 'approved') {
                await tx.profiles.update({
                    where: { id: request.employeeId },
                    data: { available_leaves: { increment: request.daysGranted } }
                });
            }
        });
        res.status(HTTP_STATUS.OK).json({ message: \`Request \${status} successfully\` });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to action request" });
    }
};

export const getMyCompOffs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const employee_id = req.user?.id;
        const compOffs = await prisma.compOffGrant.findMany({
            where: { employeeId: String(employee_id) },
            orderBy: { grantedAt: 'desc' }
        });
        res.status(HTTP_STATUS.OK).json(compOffs);
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
    }
};
`;

content = content + '\n' + compOffStr;

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Successfully patched leaves.ts");

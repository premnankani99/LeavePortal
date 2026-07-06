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
        res.status(HTTP_STATUS.OK).json({ message: `Request ${status} successfully` });
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

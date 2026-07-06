import prisma from '../prismaClient';

export const requestCompOffService = async (employee_id: string, total_days: number, reason: string) => {
    return await prisma.compOffGrant.create({
        data: {
            employeeId: employee_id,
            grantedAt: new Date(),
            daysGranted: total_days,
            reason: reason,
            status: 'pending'
        }
    });
};

export const fetchPendingCompOffsService = async () => {
    return await prisma.compOffGrant.findMany({
        where: { status: 'pending' },
        include: { employee: true },
        orderBy: { grantedAt: 'desc' }
    });
};

export const fetchMyCompOffsService = async (employee_id: string) => {
    return await prisma.compOffGrant.findMany({
        where: { employeeId: String(employee_id) },
        orderBy: { grantedAt: 'desc' }
    });
};

export const actionCompOffService = async (id: string, admin_id: string, status: string, adminNote: string) => {
    const request = await prisma.compOffGrant.findUnique({ where: { id } });
    if (!request) throw new Error("Request not found");
    if (request.status !== 'pending') throw new Error("Request is already processed");

    await prisma.$transaction(async (tx) => {
        await tx.compOffGrant.update({
            where: { id },
            data: { status, adminNote, grantedBy: admin_id }
        });
        if (status === 'approved') {
            await tx.profiles.update({
                where: { id: request.employeeId },
                data: { available_leaves: { increment: request.daysGranted } }
            });
        }
    });
};

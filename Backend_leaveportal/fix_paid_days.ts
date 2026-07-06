import prisma from './prismaClient';

async function fix() {
    const leaves = await prisma.leave_requests.findMany({ where: { paid_days: null } });
    for (const leave of leaves) {
        let paid = leave.total_days;
        if (leave.leave_type.includes('Unpaid - LOP') || leave.leave_type.includes('Unpaid - Probation')) {
            paid = 0;
        } else if (leave.leave_type.includes(' Paid, ')) {
            const match = leave.leave_type.match(/\((\d+(?:\.\d+)?)\sPaid/);
            if (match) paid = parseFloat(match[1]);
        }
        await prisma.leave_requests.update({
            where: { id: leave.id },
            data: { paid_days: paid }
        });
        console.log(`Updated ${leave.id} with paid_days = ${paid}`);
    }
}

fix().then(() => console.log('Done'));

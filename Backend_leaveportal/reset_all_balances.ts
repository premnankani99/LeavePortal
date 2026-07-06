import prisma from './prismaClient';

async function main() {
    try {
        await prisma.profiles.updateMany({
            where: { role: 'employee' },
            data: { 
                available_leaves: 0,
                total_leaves: 0
            }
        });
        console.log(`Successfully reset available leaves to 0 for all employees.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

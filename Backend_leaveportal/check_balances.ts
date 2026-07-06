import prisma from './prismaClient';

async function main() {
    try {
        const profiles = await prisma.profiles.findMany({
            select: { email: true, role: true, available_leaves: true }
        });
        console.table(profiles);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

import prisma from './prismaClient';

async function main() {
    try {
        const deleted = await prisma.compOffGrant.deleteMany({});
        console.log(`Successfully deleted ${deleted.count} comp-off grants.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const leaves = await prisma.leave_requests.findMany({ orderBy: { created_at: 'desc' }, take: 1 });
    console.log(JSON.stringify(leaves, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

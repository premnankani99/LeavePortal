import prisma from './prismaClient';

async function main() {
    const profile = await prisma.profiles.findFirst({
        where: { email: 'premn7111@gmail.com' }
    });
    if (profile) {
        await prisma.profiles.update({
            where: { id: profile.id },
            data: { total_leaves: Math.max(0, profile.total_leaves - 1) }
        });
        console.log("Fixed total leaves for Prem!");
    } else {
        console.log("Prem not found");
    }
}

main().catch(console.error);

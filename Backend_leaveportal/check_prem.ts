import prisma from './prismaClient';

async function main() {
    const profile = await prisma.profiles.findFirst({
        where: { email: 'premn7111@gmail.com' }
    });
    console.log("DB Balance for Prem:", profile?.available_leaves);
}

main();

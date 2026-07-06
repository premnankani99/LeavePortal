import prisma from '../prismaClient';

async function makeAdmin() {
    const email = process.argv[2];
    
    if (!email) {
        console.error("Please provide an email address. Example: npx ts-node scripts/make_admin.ts email@example.com");
        process.exit(1);
    }

    try {
        const user = await prisma.profiles.findUnique({ where: { email } });
        
        if (!user) {
            console.error(`User with email ${email} not found in the database.`);
            process.exit(1);
        }

        await prisma.profiles.update({
            where: { email },
            data: { role: 'admin' }
        });

        console.log(`Success! ${email} has been promoted to Admin.`);
    } catch (error) {
        console.error("Error updating user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

makeAdmin();

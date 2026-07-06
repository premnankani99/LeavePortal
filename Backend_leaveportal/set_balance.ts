import prisma from './prismaClient';

async function main() {
    try {
        const username = 'premn7111@gmail.com';
        
        // Find employee by email or username if applicable. 
        // In this schema, username is unique.
        const employee = await prisma.profiles.findUnique({
            where: { email: username }
        });

        if (!employee) {
            console.log(`Employee ${username} not found!`);
            return;
        }

        await prisma.profiles.update({
            where: { id: employee.id },
            data: { 
                available_leaves: 0,
                total_leaves: 0
            }
        });

        console.log(`Successfully updated available leaves to 0 for ${username}.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

import prisma from './prismaClient';
import bcrypt from 'bcrypt';

async function main() {
    const defaultPassword = await bcrypt.hash('password123', 10);

    const admin = await prisma.profiles.upsert({
        where: { email: 'premn7111@gmail.com' },
        update: {
            password: defaultPassword,
            role: 'admin',
            verification_status: 'approved',
            is_active: true
        },
        create: {
            email: 'premn7111@gmail.com',
            full_name: 'Prem Admin',
            password: defaultPassword,
            role: 'admin',
            verification_status: 'approved',
            is_active: true
        }
    });

    const employee = await prisma.profiles.upsert({
        where: { email: 'virendrapratapsingh2408@gmail.com' },
        update: {
            password: defaultPassword,
            role: 'employee',
            verification_status: 'approved',
            is_active: true
        },
        create: {
            email: 'virendrapratapsingh2408@gmail.com',
            full_name: 'Virendra Pratap Singh',
            password: defaultPassword,
            role: 'employee',
            verification_status: 'approved',
            is_active: true
        }
    });

    console.log('Successfully seeded database!');
    console.log(`Admin Account -> Email: ${admin.email} | Password: password123`);
    console.log(`Employee Account -> Email: ${employee.email} | Password: password123`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

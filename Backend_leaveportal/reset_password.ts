import prisma from './prismaClient';
import bcrypt from 'bcrypt';

async function checkAdmin() {
  const users = await prisma.profiles.findMany();
  
  console.log("Re-creating admin account...");
  
  const hashed = await bcrypt.hash('admin123', 10);
  
  await prisma.profiles.upsert({
    where: { email: 'premnankani99@gmail.com' },
    update: { password: hashed, role: 'admin', email_verified: true },
    create: {
      email: 'premnankani99@gmail.com',
      full_name: 'Prem (Admin)',
      password: hashed,
      role: 'admin',
      email_verified: true
    }
  });
  
  console.log("Admin account created! Email: premnankani99@gmail.com, Password: admin123");
}

checkAdmin().finally(() => prisma.$disconnect());

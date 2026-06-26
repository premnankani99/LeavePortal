import prisma from './prismaClient';

async function checkUsers() {
  const users = await prisma.profiles.findMany({
    select: {
      email: true,
      full_name: true,
      role: true,
      email_verified: true,
      verification_status: true,
      is_deleted: true,
      is_active: true
    }
  });
  console.log(users);
}
checkUsers().finally(() => prisma.$disconnect());

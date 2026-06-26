const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.profiles.findMany({
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().then(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const profiles = await prisma.profiles.findMany();
  for (const p of profiles) {
    if (p.role === 'admin') continue;
    const isVirendra = p.full_name && p.full_name.toLowerCase().includes('virendra');
    await prisma.profiles.update({
      where: { id: p.id },
      data: { designation: isVirendra ? 'Appian Developer' : 'Full Stack Developer' }
    });
  }
  console.log('Updated designations!');
}
main().catch(console.error).finally(() => prisma.$disconnect());

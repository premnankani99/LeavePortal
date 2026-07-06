import prisma from './prismaClient';
async function get() { 
  const u = await prisma.profiles.findUnique({ where: { email: 'premn7111@gmail.com' } }); 
  console.log("ACTIVE:", u?.is_active, "DELETED:", u?.is_deleted, "ROLE:", u?.role); 
} 
get().finally(() => prisma.$disconnect());

import prisma from './prismaClient';

async function deleteUser() {
  const email = 'praffulsharma38@gmail.com';
  
  const user = await prisma.profiles.findUnique({ where: { email } });
  
  if (user) {
    // Delete any associated leaves first due to foreign keys
    await prisma.leave_requests.deleteMany({ where: { employee_id: user.id } });
    
    // Delete the user
    await prisma.profiles.delete({ where: { id: user.id } });
    console.log(`✅ Permanently deleted ${email} from the database.`);
  } else {
    console.log(`❌ User ${email} not found.`);
  }
}

deleteUser().catch(console.error);

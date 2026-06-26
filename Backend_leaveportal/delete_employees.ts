// @ts-nocheck
import prisma from './prismaClient';

async function main() {
  const usersToKeepEmail = 'premn7111@gmail.com';
  
  // Find all users
  const users = await prisma.profiles.findMany();
  
  const usersToDelete = users.filter(user => {
    // Keep ONLY premn7111@gmail.com
    return user.email !== usersToKeepEmail;
  });

  console.log(`Found ${usersToDelete.length} users to delete.`);

  for (const user of usersToDelete) {
    console.log(`Deleting user: ${user.full_name} (${user.email})`);
    
    // Delete related records first
    await prisma.leave_requests.deleteMany({
      where: { employee_id: user.id }
    });
    
    await prisma.audit_logs.deleteMany({
      where: { actor_id: user.id }
    });
    
    // Delete profile
    await prisma.profiles.delete({
      where: { id: user.id }
    });
  }

  console.log('Deletion complete.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

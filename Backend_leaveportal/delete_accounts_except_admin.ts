import prisma from './prismaClient';

async function deleteAccounts() {
  console.log('Cleaning up all accounts except premnankani99@gmail.com...');
  try {
    // Delete leaves first to prevent foreign key errors
    const deletedLeaves = await prisma.leave_requests.deleteMany({
      where: {
        employee: {
          email: { not: 'premnankani99@gmail.com' }
        }
      }
    });

    const deletedProfiles = await prisma.profiles.deleteMany({
      where: {
        email: { not: 'premnankani99@gmail.com' }
      }
    });
    console.log(`Successfully deleted ${deletedProfiles.count} profiles and ${deletedLeaves.count} leave requests.`);
  } catch (err: any) {
    console.error('Error during cleanup:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAccounts();

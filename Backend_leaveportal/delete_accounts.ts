import prisma from './prismaClient';

async function cleanup() {
  console.log('Cleaning up extra accounts...');
  try {
    const deletedLeaves = await prisma.leave_requests.deleteMany({
      where: {
        employee: {
          email: { notIn: ['virendrapratap912@gmail.com', 'premnankani99@gmail.com', 'admin@example.com'] },
          full_name: { notIn: ['virendrapratap', 'prem'] } // fallback
        }
      }
    });

    const deleted = await prisma.profiles.deleteMany({
      where: {
        email: { notIn: ['virendrapratap912@gmail.com', 'premnankani99@gmail.com', 'admin@example.com'] },
        full_name: { notIn: ['virendrapratap', 'prem'] } // fallback
      }
    });
    console.log(`Deleted ${deleted.count} profiles and ${deletedLeaves.count} leave requests.`);
  } catch (err: any) {
    console.error('Error during cleanup:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();

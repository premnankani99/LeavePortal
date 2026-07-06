import prisma from './prismaClient';

async function main() {
  try {
    const deletedLeaves = await prisma.leave_requests.deleteMany({});
    console.log(`Successfully deleted ${deletedLeaves.count} leave requests.`);
  } catch (error) {
    console.error('Error deleting leave requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import prisma from './prismaClient';

async function testApply() {
  const employeeId = '12548e9e-762c-44dd-a8f1-8a30961636e2'; // Prem's ID
  
  try {
    const profileBefore = await prisma.profiles.findUnique({ where: { id: employeeId }});
    console.log("Balance before:", profileBefore?.available_leaves);

    const [newLeave, updatedProfile] = await prisma.$transaction([
      prisma.leave_requests.create({
          data: { 
            employee_id: employeeId, 
            leave_type: 'Casual Leave (Paid)', 
            start_date: new Date(), 
            end_date: new Date(), 
            total_days: 1, 
            reason: 'Test from script', 
            status: 'pending' 
          }
      }),
      prisma.profiles.update({
          where: { id: employeeId },
          data: { available_leaves: { decrement: 1 } }
      })
    ]);
    
    console.log("Balance after:", updatedProfile.available_leaves);
    
    // Now cancel it (like withdraw)
    const [cancelledLeave, refundedProfile] = await prisma.$transaction([
      prisma.leave_requests.update({
          where: { id: newLeave.id },
          data: { status: 'cancelled' }
      }),
      prisma.profiles.update({
          where: { id: employeeId },
          data: { available_leaves: { increment: 1 } }
      })
    ]);

    console.log("Balance after refund:", refundedProfile.available_leaves);

    // cleanup
    await prisma.leave_requests.delete({ where: { id: newLeave.id }});
    
  } catch (error) {
    console.error("FAIL:", error);
  }
}
testApply().finally(() => prisma.$disconnect());

import prisma from './prismaClient';

async function upgradeLatestToHR() {
  const users = await prisma.profiles.findMany({
    orderBy: { created_at: 'desc' },
    take: 5
  });

  console.log("Recent users:");
  for (const user of users) {
    console.log(`- ${user.email} | Role: ${user.role} | Verified: ${user.email_verified} | Status: ${user.verification_status}`);
  }

  // Find the latest employee who is pending or rejected
  const latest = users.find(u => u.role === 'employee' || u.role === 'hr');
  
  if (latest) {
    await prisma.profiles.update({
      where: { id: latest.id },
      data: { role: 'hr', verification_status: 'approved', email_verified: true }
    });
    console.log(`\n✅ Upgraded ${latest.email} to HR and Approved!`);
  }
}

upgradeLatestToHR().catch(console.error);

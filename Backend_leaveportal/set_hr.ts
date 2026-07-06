import prisma from './prismaClient';

async function setHR() {
  const email = '2024bcamafsprem17028@poornima.edu.in';
  
  const user = await prisma.profiles.findUnique({ where: { email } });
  
  if (user) {
    await prisma.profiles.update({
      where: { id: user.id },
      data: { role: 'hr', verification_status: 'approved', email_verified: true }
    });
    console.log(`✅ Successfully upgraded ${email} to HR and Approved!`);
  } else {
    console.log(`❌ User ${email} not found.`);
  }
}

setHR().catch(console.error);

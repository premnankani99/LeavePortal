import prisma from './prismaClient';

async function testGrant() {
  try {
    await prisma.$transaction(async (tx) => {
      console.log(Object.keys(tx));
    });
  } catch (error) {
    console.error("FAIL:", error);
  }
}
testGrant().finally(() => prisma.$disconnect());

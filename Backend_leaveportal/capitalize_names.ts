import prisma from './prismaClient';

const capitalizeName = (name: string): string => {
    if (!name) return name;
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

async function updateNames() {
  const users = await prisma.profiles.findMany();
  
  for (const user of users) {
    if (user.full_name) {
      const capitalized = capitalizeName(user.full_name);
      if (capitalized !== user.full_name) {
        await prisma.profiles.update({
          where: { id: user.id },
          data: { full_name: capitalized }
        });
        console.log(`✅ Updated ${user.full_name} -> ${capitalized}`);
      }
    }
  }
  console.log("Done updating all names.");
}

updateNames().catch(console.error);

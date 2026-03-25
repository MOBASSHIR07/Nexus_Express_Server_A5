import { prisma } from "./prisma.js";



async function main() {
  const adminEmail = "admin@nexus.com"; 


  const updatedUser = await prisma.user.update({
    where: { email: adminEmail },
    data: {
      role: "ADMIN",
      emailVerified: true
    },
  });

  console.log(`✅ ${adminEmail} is now an ADMIN!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
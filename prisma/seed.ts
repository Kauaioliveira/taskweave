import { prisma } from "../lib/prisma";

async function main() {
  if (process.env.E2E_TEST !== "1") {
    console.log("Skip seed unless E2E_TEST=1");
    return;
  }

  await prisma.user.upsert({
    where: { email: "e2e@test.com" },
    update: { name: "E2E User" },
    create: {
      email: "e2e@test.com",
      name: "E2E User",
      emailVerified: new Date(),
    },
  });

  console.log("Seeded e2e@test.com");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { prisma } from "../lib/prisma";

async function main() {
  if (process.env.E2E_TEST !== "1") {
    console.log("Skip seed unless E2E_TEST=1");
    return;
  }

  const owner = await prisma.user.upsert({
    where: { email: "e2e@test.com" },
    update: { name: "E2E Owner" },
    create: {
      email: "e2e@test.com",
      name: "E2E Owner",
      emailVerified: new Date(),
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: "viewer@e2e.test.com" },
    update: { name: "E2E Viewer" },
    create: {
      email: "viewer@e2e.test.com",
      name: "E2E Viewer",
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "accept@e2e.test.com" },
    update: { name: "E2E Invite Accepter" },
    create: {
      email: "accept@e2e.test.com",
      name: "E2E Invite Accepter",
      emailVerified: new Date(),
    },
  });

  await prisma.workspace.deleteMany({ where: { slug: "e2e-rbac-demo" } });

  const workspace = await prisma.workspace.create({
    data: {
      name: "RBAC Demo Workspace",
      slug: "e2e-rbac-demo",
      memberships: {
        create: [
          { userId: owner.id, role: "OWNER" },
          { userId: viewer.id, role: "VIEWER" },
        ],
      },
    },
  });

  await prisma.workspaceInvite.deleteMany({
    where: { token: "e2e_wrongemail_invite_token_00001" },
  });

  await prisma.workspaceInvite.create({
    data: {
      workspaceId: workspace.id,
      email: "invited-only@e2e.test.com",
      role: "MEMBER",
      token: "e2e_wrongemail_invite_token_00001",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdById: owner.id,
    },
  });

  await prisma.workspaceInvite.deleteMany({
    where: { token: "e2e_accept_invite_token_ok" },
  });

  await prisma.workspaceInvite.create({
    data: {
      workspaceId: workspace.id,
      email: "accept@e2e.test.com",
      role: "MEMBER",
      token: "e2e_accept_invite_token_ok",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdById: owner.id,
    },
  });

  console.log(
    "Seeded e2e@test.com, viewer@e2e.test.com, accept@e2e.test.com, workspace e2e-rbac-demo, wrong-email and accept-invite tokens.",
  );
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

import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up
  await prisma.directMessage.deleteMany();
  await prisma.directMessageParticipant.deleteMany();
  await prisma.directMessageThread.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.pinnedMessage.deleteMany();
  await prisma.message.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.serverMember.deleteMany();
  await prisma.server.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const alice = await prisma.user.create({
    data: {
      email: "alice@dollarcord.app",
      username: "alice",
      displayName: "Alice",
      passwordHash: hashSync("password123", 12),
      bio: "DollarCord admin and founder 💸",
      avatarUrl: null,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@dollarcord.app",
      username: "bob",
      displayName: "Bob",
      passwordHash: hashSync("password123", 12),
      bio: "Just here to chat!",
      avatarUrl: null,
    },
  });

  const charlie = await prisma.user.create({
    data: {
      email: "charlie@dollarcord.app",
      username: "charlie",
      displayName: "Charlie",
      passwordHash: hashSync("password123", 12),
      bio: "Backend dev, loves SQLite",
      avatarUrl: null,
    },
  });

  console.log("✅ Created 3 users");

  // Server
  const server = await prisma.server.create({
    data: {
      name: "DollarCord HQ",
      description: "The official DollarCord community server",
      ownerId: alice.id,
    },
  });

  // Members
  await prisma.serverMember.createMany({
    data: [
      { serverId: server.id, userId: alice.id, role: "OWNER" },
      { serverId: server.id, userId: bob.id, role: "ADMIN" },
      { serverId: server.id, userId: charlie.id, role: "MEMBER" },
    ],
  });

  // Channels
  const general = await prisma.channel.create({
    data: { serverId: server.id, name: "general", description: "General chat", position: 0 },
  });
  const offtopic = await prisma.channel.create({
    data: { serverId: server.id, name: "off-topic", description: "Anything goes", position: 1 },
  });
  const dev = await prisma.channel.create({
    data: { serverId: server.id, name: "dev-talk", description: "Dev discussions", position: 2 },
  });

  // Invite
  await prisma.invite.create({
    data: {
      code: "dollarcord",
      serverId: server.id,
      createdBy: alice.id,
    },
  });

  console.log("✅ Created server with 3 channels");

  // Messages
  const now = Date.now();
  const msgs = [
    { channelId: general.id, userId: alice.id, content: "Welcome to DollarCord HQ! 🎉 This is the place to be.", createdAt: new Date(now - 3600_000) },
    { channelId: general.id, userId: bob.id, content: "Hey everyone! Great to be here 👋", createdAt: new Date(now - 3500_000) },
    { channelId: general.id, userId: charlie.id, content: "Nice platform! Is it built with Next.js?", createdAt: new Date(now - 3400_000) },
    { channelId: general.id, userId: alice.id, content: "Yes! Next.js + Prisma + Socket.IO + SQLite. Full stack goodness 💸", createdAt: new Date(now - 3300_000) },
    { channelId: general.id, userId: bob.id, content: "Love the dark theme. Very slick.", createdAt: new Date(now - 3200_000) },
    { channelId: general.id, userId: charlie.id, content: "The real-time typing indicators are a nice touch", createdAt: new Date(now - 3100_000) },
    { channelId: offtopic.id, userId: bob.id, content: "Anyone else getting into gardening lately?", createdAt: new Date(now - 2000_000) },
    { channelId: offtopic.id, userId: charlie.id, content: "I planted some tomatoes last week!", createdAt: new Date(now - 1900_000) },
    { channelId: dev.id, userId: alice.id, content: "First push to the repo is live 🚀", createdAt: new Date(now - 1000_000) },
    { channelId: dev.id, userId: charlie.id, content: "PRs welcome! Check the contributing guide.", createdAt: new Date(now - 900_000) },
  ];

  for (const msg of msgs) {
    await prisma.message.create({ data: msg });
  }

  console.log("✅ Created sample messages");

  // DM thread between alice and bob
  const thread = await prisma.directMessageThread.create({ data: {} });
  await prisma.directMessageParticipant.createMany({
    data: [
      { threadId: thread.id, userId: alice.id },
      { threadId: thread.id, userId: bob.id },
    ],
  });
  await prisma.directMessage.createMany({
    data: [
      { threadId: thread.id, senderId: alice.id, content: "Hey Bob! Welcome to DollarCord 😊", createdAt: new Date(now - 5000_000) },
      { threadId: thread.id, senderId: bob.id, content: "Thanks Alice! It looks amazing.", createdAt: new Date(now - 4900_000) },
      { threadId: thread.id, senderId: alice.id, content: "Let me know if you find any bugs!", createdAt: new Date(now - 4800_000) },
    ],
  });

  console.log("✅ Created DM thread");
  console.log("\n🎉 Seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  alice@dollarcord.app / password123");
  console.log("  bob@dollarcord.app   / password123");
  console.log("  charlie@dollarcord.app / password123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Invite code: dollarcord");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

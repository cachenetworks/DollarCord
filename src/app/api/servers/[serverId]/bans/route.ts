import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromReq } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canBanMember, canManageServer } from "@/lib/serverPermissions";
import { getIO } from "@/server/socketServer";
import type { MemberRole } from "@/types";

interface Params { params: { serverId: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId: params.serverId, userId: user.id } },
  });
  if (!actor || !canManageServer(actor.role as MemberRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bans = await prisma.serverBan.findMany({
    where: { serverId: params.serverId },
    include: {
      user: true,
      actor: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bans });
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId: params.serverId, userId: user.id } },
  });
  if (!actor || !canManageServer(actor.role as MemberRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const targetUserId = typeof body.targetUserId === "string" ? body.targetUserId : "";
  const reason = typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : null;

  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
  }
  if (targetUserId === user.id) {
    return NextResponse.json({ error: "You cannot ban yourself" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const targetMember = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId: params.serverId, userId: targetUserId } },
  });

  if (targetMember && !canBanMember(actor.role as MemberRole, targetMember.role as MemberRole)) {
    return NextResponse.json({ error: "You cannot ban that member" }, { status: 403 });
  }

  const [, ban] = await prisma.$transaction([
    prisma.serverMember.deleteMany({
      where: { serverId: params.serverId, userId: targetUserId },
    }),
    prisma.serverBan.upsert({
      where: { serverId_userId: { serverId: params.serverId, userId: targetUserId } },
      update: {
        bannedBy: user.id,
        reason,
        createdAt: new Date(),
      },
      create: {
        serverId: params.serverId,
        userId: targetUserId,
        bannedBy: user.id,
        reason,
      },
      include: {
        user: true,
        actor: true,
      },
    }),
  ]);

  try {
    const io = getIO();
    io.to(`server:${params.serverId}`).emit("server:members:update");
    io.to(`user:${targetUserId}`).emit("servers:update");
  } catch {}

  return NextResponse.json({ ban }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId: params.serverId, userId: user.id } },
  });
  if (!actor || !canManageServer(actor.role as MemberRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetUserId = req.nextUrl.searchParams.get("userId");
  if (!targetUserId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  await prisma.serverBan.deleteMany({
    where: { serverId: params.serverId, userId: targetUserId },
  });

  return NextResponse.json({ ok: true });
}

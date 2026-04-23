import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromReq } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: { serverId: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId: params.serverId, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await prisma.serverMember.findMany({
    where: { serverId: params.serverId },
    include: { user: true },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  return NextResponse.json({ members });
}

// PATCH /api/servers/[serverId]/members?userId= — update role or kick
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId: params.serverId, userId: user.id } },
  });
  if (!actor || !["OWNER", "ADMIN"].includes(actor.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetUserId = req.nextUrl.searchParams.get("userId");
  if (!targetUserId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const body = await req.json();
  const { role, kick } = body as { role?: string; kick?: boolean };

  if (kick) {
    const server = await prisma.server.findUnique({ where: { id: params.serverId } });
    if (targetUserId === server?.ownerId) {
      return NextResponse.json({ error: "Cannot kick owner" }, { status: 403 });
    }
    await prisma.serverMember.delete({
      where: { serverId_userId: { serverId: params.serverId, userId: targetUserId } },
    });
    return NextResponse.json({ ok: true });
  }

  if (role && ["ADMIN", "MEMBER"].includes(role)) {
    if (actor.role !== "OWNER") {
      return NextResponse.json({ error: "Only owner can change roles" }, { status: 403 });
    }
    await prisma.serverMember.update({
      where: { serverId_userId: { serverId: params.serverId, userId: targetUserId } },
      data: { role },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "No action specified" }, { status: 400 });
}

// DELETE — leave server
export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const server = await prisma.server.findUnique({ where: { id: params.serverId } });
  if (server?.ownerId === user.id) {
    return NextResponse.json({ error: "Owner cannot leave — transfer ownership or delete server" }, { status: 400 });
  }

  await prisma.serverMember.delete({
    where: { serverId_userId: { serverId: params.serverId, userId: user.id } },
  });

  return NextResponse.json({ ok: true });
}

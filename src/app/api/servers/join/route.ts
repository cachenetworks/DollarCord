import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromReq } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { joinServerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const user = await getCurrentUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = joinServerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const invite = await prisma.invite.findUnique({
      where: { code: parsed.data.code },
      include: { server: { include: { channels: { orderBy: { position: "asc" } } } } },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    // Check expiry
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
    }

    // Check max uses
    if (invite.maxUses !== null && invite.uses >= invite.maxUses) {
      return NextResponse.json({ error: "Invite has reached its maximum uses" }, { status: 410 });
    }

    // Check if already a member
    const existing = await prisma.serverMember.findUnique({
      where: { serverId_userId: { serverId: invite.serverId, userId: user.id } },
    });

    if (existing) {
      return NextResponse.json({ server: invite.server, alreadyMember: true });
    }

    // Join server
    await prisma.$transaction([
      prisma.serverMember.create({
        data: { serverId: invite.serverId, userId: user.id, role: "MEMBER" },
      }),
      prisma.invite.update({
        where: { id: invite.id },
        data: { uses: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ server: invite.server });
  } catch (err) {
    console.error("[servers/join POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

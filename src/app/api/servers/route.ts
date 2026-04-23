import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromReq } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createServerSchema } from "@/lib/validations";

// List user's servers
export async function GET(req: NextRequest) {
  const user = await getCurrentUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.serverMember.findMany({
    where: { userId: user.id },
    include: {
      server: {
        include: { channels: { orderBy: { position: "asc" } } },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  const servers = memberships.map((m) => ({ ...m.server, role: m.role }));
  return NextResponse.json({ servers });
}

// Create server
export async function POST(req: NextRequest) {
  const user = await getCurrentUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createServerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const server = await prisma.server.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        iconUrl: parsed.data.iconUrl ?? null,
        ownerId: user.id,
        members: {
          create: { userId: user.id, role: "OWNER" },
        },
        channels: {
          create: { name: "general", description: "General discussion", position: 0 },
        },
      },
      include: { channels: true },
    });

    return NextResponse.json({ server }, { status: 201 });
  } catch (err) {
    console.error("[servers POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

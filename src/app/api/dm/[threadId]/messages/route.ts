import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromReq } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema } from "@/lib/validations";
import { getIO } from "@/server/socketServer";

interface Params { params: { threadId: string } }

async function verifyParticipant(threadId: string, userId: string) {
  const p = await prisma.directMessageParticipant.findUnique({
    where: { threadId_userId: { threadId, userId } },
  });
  return Boolean(p);
}

export async function GET(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await verifyParticipant(params.threadId, user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cursor = req.nextUrl.searchParams.get("cursor");
  const limit = 50;

  const messages = await prisma.directMessage.findMany({
    where: {
      threadId: params.threadId,
      deleted: false,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    include: { sender: true },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });

  const hasMore = messages.length > limit;
  const result = messages.slice(0, limit).reverse();

  return NextResponse.json({ messages: result, hasMore, cursor: result.length > 0 ? result[0].createdAt : null });
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await verifyParticipant(params.threadId, user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const [message] = await prisma.$transaction([
    prisma.directMessage.create({
      data: { threadId: params.threadId, senderId: user.id, content: parsed.data.content },
      include: { sender: true },
    }),
    prisma.directMessageThread.update({
      where: { id: params.threadId },
      data: { updatedAt: new Date() },
    }),
  ]);

  try {
    getIO().to(`dm:${params.threadId}`).emit("dm:message", message);
  } catch {}

  return NextResponse.json({ message }, { status: 201 });
}

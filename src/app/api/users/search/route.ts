import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromReq } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) return NextResponse.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: user.id } },
        {
          OR: [
            { username: { contains: q } },
            { displayName: { contains: q } },
          ],
        },
      ],
    },
    select: { id: true, username: true, displayName: true, avatarUrl: true },
    take: 10,
  });

  return NextResponse.json({ users });
}

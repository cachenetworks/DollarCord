import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("dollarcord_session")?.value;
    if (token) {
      await prisma.session.deleteMany({ where: { token } }).catch(() => {});
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set("dollarcord_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ ok: true });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, username, displayName, password } = parsed.data;
    const userCount = await prisma.user.count();

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      const field = existing.email === email ? "Email" : "Username";
      return NextResponse.json({ error: `${field} is already in use` }, { status: 409 });
    }

    const passwordHash = hashSync(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        displayName,
        passwordHash,
        isPlatformAdmin: userCount === 0,
      },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } });

    const { passwordHash: _, ...safeUser } = user;

    const response = NextResponse.json({ user: safeUser, token }, { status: 201 });
    response.cookies.set("dollarcord_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

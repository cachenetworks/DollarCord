import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { prisma } from "./prisma";
import type { User } from "@/types";

const COOKIE_NAME = "dollarcord_session";

/** For Server Components and layouts (uses next/headers cookies). */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return validateToken(token);
  } catch {
    return null;
  }
}

/** For Route Handlers (reads from the NextRequest object directly). */
export async function getCurrentUserFromReq(req: NextRequest): Promise<User | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return validateToken(token);
}

/** Validate a raw session token (used by socket server and API routes). */
export async function validateToken(token: string): Promise<User | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) return null;
    const { passwordHash: _, ...user } = session.user;
    return user as User;
  } catch {
    return null;
  }
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/AppShell";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch user's servers for the server rail
  const memberships = await prisma.serverMember.findMany({
    where: { userId: user.id },
    include: {
      server: {
        include: {
          channels: { orderBy: { position: "asc" } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  const servers = memberships.map((m) => ({
    ...m.server,
    role: m.role,
  }));

  return (
    <Providers initialUser={user}>
      <AppShell user={user} servers={servers}>
        {children}
      </AppShell>
    </Providers>
  );
}

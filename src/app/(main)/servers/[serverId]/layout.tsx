import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChannelSidebar } from "@/components/layout/ChannelSidebar";
import { MemberSidebar } from "@/components/layout/MemberSidebar";

interface Props {
  children: React.ReactNode;
  params: { serverId: string };
}

export default async function ServerLayout({ children, params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const server = await prisma.server.findUnique({
    where: { id: params.serverId },
    include: {
      channels: { orderBy: { position: "asc" } },
      members: {
        include: { user: true },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      },
    },
  });

  if (!server) notFound();

  // Verify membership
  const membership = server.members.find((m) => m.userId === user.id);
  if (!membership) notFound();

  const typedMembers = server.members.map((m) => ({
    ...m,
    role: m.role as "OWNER" | "ADMIN" | "MEMBER",
    user: { id: m.user.id, email: m.user.email, username: m.user.username, displayName: m.user.displayName, bio: m.user.bio, avatarUrl: m.user.avatarUrl, createdAt: m.user.createdAt },
  }));

  return (
    <div className="flex flex-1 overflow-hidden">
      <ChannelSidebar
        server={server}
        channels={server.channels}
        currentUserId={user.id}
        currentUserRole={membership.role as "OWNER" | "ADMIN" | "MEMBER"}
      />
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
      <MemberSidebar
        members={typedMembers}
        serverId={server.id}
        currentUserId={user.id}
        currentUserRole={membership.role as "OWNER" | "ADMIN" | "MEMBER"}
      />
    </div>
  );
}

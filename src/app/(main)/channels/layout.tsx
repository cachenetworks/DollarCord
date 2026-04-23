import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DMSidebar } from "@/components/layout/DMSidebar";

export default async function ChannelsLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) return null;

  // Load DM threads
  const threads = await prisma.directMessageThread.findMany({
    where: {
      participants: { some: { userId: user.id } },
    },
    include: {
      participants: { include: { user: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Shape threads for the sidebar
  const dmThreads = threads.map((t) => ({
    id: t.id,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    participants: t.participants,
    otherUser: t.participants.find((p) => p.userId !== user.id)?.user,
    lastMessage: t.messages[0] ?? null,
  }));

  return (
    <div className="flex flex-1 overflow-hidden">
      <DMSidebar threads={dmThreads} currentUserId={user.id} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

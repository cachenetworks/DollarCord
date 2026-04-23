import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DMChatArea } from "@/components/chat/DMChatArea";

interface Props {
  params: { threadId: string };
}

export default async function DMPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const thread = await prisma.directMessageThread.findUnique({
    where: { id: params.threadId },
    include: {
      participants: { include: { user: true } },
    },
  });

  if (!thread) notFound();

  // Verify user is a participant
  const isParticipant = thread.participants.some((p) => p.userId === user.id);
  if (!isParticipant) notFound();

  const otherUser = thread.participants.find((p) => p.userId !== user.id)?.user;

  const initialMessages = await prisma.directMessage.findMany({
    where: { threadId: params.threadId },
    include: { sender: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <DMChatArea
      thread={{ ...thread, participants: thread.participants }}
      currentUser={user}
      otherUser={otherUser!}
      initialMessages={initialMessages.reverse()}
    />
  );
}

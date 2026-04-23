import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props {
  params: { serverId: string };
}

export default async function ServerIndexPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const firstChannel = await prisma.channel.findFirst({
    where: { serverId: params.serverId },
    orderBy: { position: "asc" },
  });

  if (firstChannel) {
    redirect(`/servers/${params.serverId}/${firstChannel.id}`);
  }

  // Server has no channels
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="text-6xl mb-4">📭</div>
      <h2 className="text-dc-text text-xl font-semibold mb-2">No channels yet</h2>
      <p className="text-dc-muted text-sm">
        Ask a server admin to create some channels.
      </p>
    </div>
  );
}

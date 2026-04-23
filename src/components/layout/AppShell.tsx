"use client";

import { ServerRail } from "./ServerRail";
import type { User, Server, Channel } from "@/types";

interface ServerWithRole extends Server {
  role: string;
  channels: Channel[];
}

interface Props {
  user: User;
  servers: ServerWithRole[];
  children: React.ReactNode;
}

export function AppShell({ user, servers, children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-dc-chat">
      <ServerRail user={user} initialServers={servers} />
      <div className="flex flex-1 overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  );
}

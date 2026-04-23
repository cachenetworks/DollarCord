"use client";

import { useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { Avatar } from "@/components/ui/Avatar";
import type { ServerMember } from "@/types";

interface Props {
  members: ServerMember[];
  serverId: string;
  ownerId: string;
}

const roleOrder = { OWNER: 0, ADMIN: 1, MEMBER: 2 };
const roleLabel = { OWNER: "Owner", ADMIN: "Admins", MEMBER: "Members" };

function groupByRole(members: ServerMember[]) {
  const groups: Record<string, ServerMember[]> = { OWNER: [], ADMIN: [], MEMBER: [] };
  for (const m of members) groups[m.role]?.push(m);
  return groups;
}

export function MemberSidebar({ members, serverId, ownerId }: Props) {
  const { presence } = useSocket();
  const [search, setSearch] = useState("");

  const filtered = members.filter(
    (m) =>
      m.user.displayName.toLowerCase().includes(search.toLowerCase()) ||
      m.user.username.toLowerCase().includes(search.toLowerCase())
  );

  const groups = groupByRole(filtered);
  const onlineCount = members.filter((m) => presence[m.userId]).length;

  return (
    <aside className="w-60 bg-dc-sidebar border-l border-dc-border flex flex-col shrink-0 overflow-hidden">
      <div className="px-3 py-3 border-b border-dc-border">
        <input
          type="text"
          placeholder="Search members"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-dc-input text-dc-text text-sm px-3 py-1.5 rounded border border-dc-border focus:border-dc-accent focus:outline-none placeholder-dc-muted"
        />
        <p className="text-dc-muted text-xs mt-2 px-1">
          {members.length} member{members.length !== 1 ? "s" : ""}
          {onlineCount > 0 && ` · ${onlineCount} online`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2">
        {(["OWNER", "ADMIN", "MEMBER"] as const).map((role) => {
          const group = groups[role];
          if (!group || group.length === 0) return null;

          return (
            <div key={role} className="mb-3">
              <p className="text-xs font-semibold text-dc-muted uppercase tracking-wide px-2 mb-1">
                {roleLabel[role]} — {group.length}
              </p>
              {group.map((member) => {
                const online = presence[member.userId] ?? false;
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-dc-hover transition-colors cursor-pointer group"
                  >
                    <Avatar user={member.user} size="sm" online={online} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${online ? "text-dc-text" : "text-dc-muted"}`}>
                        {member.user.displayName}
                      </p>
                      <p className="text-xs text-dc-faint truncate">@{member.user.username}</p>
                    </div>
                    {role === "OWNER" && (
                      <span className="shrink-0 text-xs text-dc-warning" title="Server Owner">👑</span>
                    )}
                    {role === "ADMIN" && (
                      <span className="shrink-0 text-xs text-dc-accent" title="Admin">🛡</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-dc-muted text-xs px-2">No members found</p>
        )}
      </div>
    </aside>
  );
}

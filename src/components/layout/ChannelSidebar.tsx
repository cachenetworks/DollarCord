"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { UserBar } from "./UserBar";
import { CreateChannelModal } from "@/components/modals/CreateChannelModal";
import { InviteModal } from "@/components/modals/InviteModal";
import { ServerSettingsModal } from "@/components/settings/ServerSettingsModal";
import type { Channel, Server, MemberRole } from "@/types";

interface Props {
  server: Server;
  channels: Channel[];
  currentUserId: string;
  currentUserRole: MemberRole;
}

export function ChannelSidebar({ server, channels: initialChannels, currentUserId, currentUserRole }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { socket } = useSocket();
  const { addToast } = useToast();
  const { user, logout } = useAuth();
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingChannel, setEditingChannel] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const canManage = ["OWNER", "ADMIN"].includes(currentUserRole);
  const activeChannelId = pathname.match(/\/servers\/[^/]+\/([^/]+)/)?.[1];

  useEffect(() => {
    if (!socket) return;

    socket.emit("server:join", server.id);

    socket.on("server:channel:create", ({ channel }: { channel: Channel }) => {
      setChannels((prev) => [...prev, channel].sort((a, b) => a.position - b.position));
    });

    socket.on("server:channel:update", ({ channel }: { channel: Channel }) => {
      setChannels((prev) => prev.map((c) => (c.id === channel.id ? channel : c)));
    });

    socket.on("server:channel:delete", ({ channelId }: { channelId: string }) => {
      setChannels((prev) => prev.filter((c) => c.id !== channelId));
      if (activeChannelId === channelId) {
        router.push(`/servers/${server.id}`);
      }
    });

    return () => {
      socket.off("server:channel:create");
      socket.off("server:channel:update");
      socket.off("server:channel:delete");
      socket.emit("server:leave", server.id);
    };
  }, [socket, server.id, activeChannelId, router]);

  async function handleDeleteChannel(channelId: string) {
    if (!confirm("Delete this channel and all its messages?")) return;
    const res = await fetch(`/api/channels/${channelId}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      addToast(d.error || "Failed to delete channel", "error");
    }
  }

  async function handleRenameChannel(channelId: string) {
    if (!editName.trim()) return;
    const res = await fetch(`/api/channels/${channelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.toLowerCase().replace(/\s+/g, "-") }),
    });
    if (res.ok) {
      setEditingChannel(null);
      setEditName("");
    } else {
      const d = await res.json();
      addToast(d.error || "Rename failed", "error");
    }
  }

  async function handleLeaveServer() {
    if (!confirm("Leave this server?")) return;
    const res = await fetch(`/api/servers/${server.id}/members`, { method: "DELETE" });
    if (res.ok) {
      router.push("/channels");
      router.refresh();
    }
  }

  return (
    <>
      <aside className="w-60 min-h-0 bg-dc-sidebar flex flex-col shrink-0 overflow-visible">
        {/* Server header */}
        <div className="relative">
          <button
            className="w-full flex items-center justify-between px-4 h-12 font-semibold text-dc-text hover:bg-dc-hover transition-colors border-b border-dc-border"
            onClick={() => setShowMenu((p) => !p)}
          >
            <span className="truncate">{server.name}</span>
            <span className="text-dc-muted ml-1">{showMenu ? "▲" : "▼"}</span>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute top-full left-2 right-2 z-50 bg-dc-rail rounded-lg shadow-xl border border-dc-border overflow-hidden">
                <button
                  className="w-full text-left px-3 py-2 text-sm text-dc-text hover:bg-dc-hover transition-colors"
                  onClick={() => { setShowInvite(true); setShowMenu(false); }}
                >
                  Invite People
                </button>
                {canManage && (
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-dc-text hover:bg-dc-hover transition-colors"
                    onClick={() => { setShowSettings(true); setShowMenu(false); }}
                  >
                    Server Settings
                  </button>
                )}
                {canManage && (
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-dc-text hover:bg-dc-hover transition-colors"
                    onClick={() => { setShowCreate(true); setShowMenu(false); }}
                  >
                    Create Channel
                  </button>
                )}
                {currentUserRole !== "OWNER" && (
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-dc-danger hover:bg-dc-hover transition-colors"
                    onClick={() => { handleLeaveServer(); setShowMenu(false); }}
                  >
                    Leave Server
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
          <div className="px-2 mb-1 flex items-center justify-between group">
            <span className="text-xs font-semibold text-dc-muted uppercase tracking-wide px-2">
              Text Channels
            </span>
            {canManage && (
              <button
                onClick={() => setShowCreate(true)}
                className="text-dc-muted hover:text-dc-text transition-colors opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center font-bold text-base"
                title="Create Channel"
              >
                +
              </button>
            )}
          </div>

          {channels.map((channel) => {
            const isActive = activeChannelId === channel.id;
            const isEditing = editingChannel === channel.id;

            return (
              <div
                key={channel.id}
                className={`group flex items-center mx-2 rounded px-2 h-8 cursor-pointer transition-colors ${
                  isActive ? "bg-dc-active text-dc-text" : "text-dc-muted hover:text-dc-text hover:bg-dc-hover"
                }`}
              >
                {isEditing ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => { setEditingChannel(null); setEditName(""); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameChannel(channel.id);
                      if (e.key === "Escape") { setEditingChannel(null); setEditName(""); }
                    }}
                    className="flex-1 bg-dc-input text-dc-text text-sm px-2 py-0.5 rounded border border-dc-accent focus:outline-none"
                  />
                ) : (
                  <Link
                    href={`/servers/${server.id}/${channel.id}`}
                    className="flex items-center gap-1.5 flex-1 min-w-0"
                  >
                    <span className="text-dc-muted text-base leading-none">#</span>
                    <span className="text-sm truncate">{channel.name}</span>
                  </Link>
                )}

                {canManage && !isEditing && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => { setEditingChannel(channel.id); setEditName(channel.name); }}
                      className="w-5 h-5 flex items-center justify-center text-dc-muted hover:text-dc-text rounded text-xs"
                      title="Rename"
                    >
                      ✏
                    </button>
                    <button
                      onClick={() => handleDeleteChannel(channel.id)}
                      className="w-5 h-5 flex items-center justify-center text-dc-muted hover:text-dc-danger rounded text-xs"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {channels.length === 0 && (
            <p className="text-dc-muted text-xs px-4 py-2">No channels yet</p>
          )}
        </div>

        {/* User bar */}
        {user && <UserBar user={user} onLogout={logout} />}
      </aside>

      <CreateChannelModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        serverId={server.id}
        onCreated={(ch) => setChannels((prev) => [...prev, ch])}
      />
      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        serverId={server.id}
      />
      {showSettings && (
        <ServerSettingsModal
          open={showSettings}
          onClose={() => setShowSettings(false)}
          server={server}
          currentUserRole={currentUserRole}
        />
      )}
    </>
  );
}

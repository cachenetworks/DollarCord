"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
  onJoined: (server: any) => void;
}

export function JoinServerModal({ open, onClose, onJoined }: Props) {
  const { addToast } = useToast();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/servers/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Failed to join server", "error");
        return;
      }
      if (data.alreadyMember) {
        addToast("You're already in that server!", "info");
      } else {
        addToast(`Joined ${data.server.name}!`, "success");
      }
      onJoined(data.server);
      setCode("");
      // Navigate to the joined server
      const firstChannel = data.server.channels?.[0];
      if (firstChannel) {
        router.push(`/servers/${data.server.id}/${firstChannel.id}`);
      } else {
        router.push(`/servers/${data.server.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Join a Server">
      <p className="text-dc-muted text-sm mb-4">
        Enter an invite code to join a server. Ask a server admin for the code.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-dc-muted uppercase tracking-wide mb-1.5">
            Invite Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full bg-dc-input text-dc-text px-3 py-2 rounded border border-dc-border focus:border-dc-accent focus:outline-none text-sm font-mono"
            placeholder="e.g. dollarcord"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-dc-muted hover:text-dc-text transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-4 py-2 bg-dc-accent hover:bg-dc-accent-hover disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors"
          >
            {loading ? "Joining…" : "Join Server"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

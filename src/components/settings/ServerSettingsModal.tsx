"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import type { Server, MemberRole } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  server: Server;
  currentUserRole: MemberRole;
}

export function ServerSettingsModal({ open, onClose, server, currentUserRole }: Props) {
  const router = useRouter();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: server.name, description: server.description ?? "", iconUrl: server.iconUrl ?? "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/servers/${server.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name || undefined, description: form.description || null, iconUrl: form.iconUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error || "Update failed", "error"); return; }
      addToast("Server updated!", "success");
      onClose();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (confirmDelete !== server.name) {
      addToast("Server name doesn't match", "error");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/servers/${server.id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); addToast(d.error || "Delete failed", "error"); return; }
      addToast("Server deleted", "info");
      onClose();
      router.push("/channels");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Server Settings" size="lg">
      <form onSubmit={handleSave} className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-dc-muted uppercase tracking-wide mb-1.5">Server Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            maxLength={100}
            className="w-full bg-dc-input text-dc-text px-3 py-2 rounded border border-dc-border focus:border-dc-accent focus:outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-dc-muted uppercase tracking-wide mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            maxLength={500}
            rows={2}
            className="w-full bg-dc-input text-dc-text px-3 py-2 rounded border border-dc-border focus:border-dc-accent focus:outline-none text-sm resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-dc-muted uppercase tracking-wide mb-1.5">Icon URL</label>
          <input
            type="url"
            value={form.iconUrl}
            onChange={(e) => setForm((f) => ({ ...f, iconUrl: e.target.value }))}
            className="w-full bg-dc-input text-dc-text px-3 py-2 rounded border border-dc-border focus:border-dc-accent focus:outline-none text-sm"
            placeholder="https://…"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-dc-muted hover:text-dc-text transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-dc-accent hover:bg-dc-accent-hover disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>

      {currentUserRole === "OWNER" && (
        <div className="border-t border-dc-border pt-5">
          <h3 className="text-dc-danger font-semibold mb-2">Delete Server</h3>
          <p className="text-dc-muted text-sm mb-3">
            This is irreversible. All channels, messages, and members will be permanently deleted. Type <span className="font-mono text-dc-text">{server.name}</span> to confirm.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              placeholder={server.name}
              className="flex-1 bg-dc-input text-dc-text px-3 py-2 rounded border border-dc-border focus:border-dc-danger focus:outline-none text-sm"
            />
            <button
              onClick={handleDelete}
              disabled={deleting || confirmDelete !== server.name}
              className="px-4 py-2 bg-dc-danger hover:bg-dc-danger-hover disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { User } from "@/types";

interface Props {
  user: User;
  onLogout: () => void;
  onSettings?: () => void;
}

export function UserBar({ user, onLogout, onSettings }: Props) {
  return (
    <div className="border-t border-dc-border bg-dc-overlay px-2 py-2 flex items-center gap-2 shrink-0">
      <Avatar user={user} size="sm" online={true} />
      <div className="flex-1 min-w-0">
        <p className="text-dc-text text-sm font-semibold truncate">{user.displayName}</p>
        <p className="text-dc-muted text-xs truncate">@{user.username}</p>
      </div>
      <div className="flex items-center gap-1">
        <Link
          href="/settings"
          className="w-7 h-7 flex items-center justify-center text-dc-muted hover:text-dc-text hover:bg-dc-hover rounded transition-colors text-base"
          title="Settings"
        >
          ⚙
        </Link>
        <button
          onClick={onLogout}
          className="w-7 h-7 flex items-center justify-center text-dc-muted hover:text-dc-danger hover:bg-dc-hover rounded transition-colors text-base"
          title="Logout"
        >
          ↩
        </button>
      </div>
    </div>
  );
}

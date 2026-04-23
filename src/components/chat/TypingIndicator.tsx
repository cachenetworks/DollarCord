"use client";

import type { TypingUser } from "@/types";

interface Props {
  typingUsers: TypingUser[];
}

export function TypingIndicator({ typingUsers }: Props) {
  if (typingUsers.length === 0) return <div className="h-5 px-4" />;

  let text: string;
  if (typingUsers.length === 1) {
    text = `${typingUsers[0].displayName} is typing`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing`;
  } else {
    text = `${typingUsers.length} people are typing`;
  }

  return (
    <div className="flex items-center gap-2 px-4 h-5">
      {/* Animated dots */}
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-dc-muted rounded-full animate-pulse-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
      <span className="text-dc-muted text-xs font-medium">{text}…</span>
    </div>
  );
}

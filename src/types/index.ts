export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  isPlatformAdmin?: boolean;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface Server {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  ownerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ServerMember {
  id: string;
  serverId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: Date | string;
  user: User;
}

export interface ServerBan {
  id: string;
  serverId: string;
  userId: string;
  bannedBy: string;
  reason: string | null;
  createdAt: Date | string;
  user: User;
  actor?: User;
}

export interface Invite {
  id: string;
  code: string;
  serverId: string;
  createdBy: string;
  maxUses: number | null;
  uses: number;
  expiresAt: Date | string | null;
  createdAt: Date | string;
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  description: string | null;
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  user: User;
  createdAt: Date | string;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  edited: boolean;
  deleted: boolean;
  replyToId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  user: User;
  reactions: Reaction[];
  replyTo?: Message | null;
}

export interface DirectMessage {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  edited: boolean;
  deleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  sender: User;
}

export interface DirectMessageThread {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  participants: { user: User }[];
  messages?: DirectMessage[];
  // Computed for display
  otherUser?: User;
  lastMessage?: DirectMessage | null;
}

export interface TypingUser {
  userId: string;
  username: string;
  displayName: string;
}

export type PresenceMap = Record<string, boolean>;

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";

export interface ServerWithDetails extends Server {
  members: ServerMember[];
  channels: Channel[];
}

export interface ApiError {
  error: string;
}

export interface PaginatedMessages {
  messages: Message[];
  hasMore: boolean;
  cursor: string | null;
}

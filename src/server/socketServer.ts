import { Server as SocketServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { validateToken } from "../lib/auth";

const SESSION_COOKIE = "dollarcord_session";

declare global {
  // eslint-disable-next-line no-var
  var __io: SocketServer | undefined;
}

const onlineUsers = new Map<string, number>();

function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === name) return decodeURIComponent(rawValue.join("="));
  }

  return undefined;
}

function markOnline(userId: string): boolean {
  const count = onlineUsers.get(userId) ?? 0;
  onlineUsers.set(userId, count + 1);
  return count === 0;
}

function markOffline(userId: string): boolean {
  const count = onlineUsers.get(userId) ?? 0;
  if (count <= 1) {
    onlineUsers.delete(userId);
    return true;
  }

  onlineUsers.set(userId, count - 1);
  return false;
}

function presenceSnapshot(): Record<string, boolean> {
  return Object.fromEntries(Array.from(onlineUsers.keys()).map((userId) => [userId, true]));
}

export function initSocketServer(httpServer: HTTPServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    const authToken = socket.handshake.auth?.token;
    const token =
      (typeof authToken === "string" && authToken) ||
      readCookie(socket.handshake.headers.cookie, SESSION_COOKIE);

    if (!token) return next(new Error("Authentication required"));

    const user = await validateToken(token);
    if (!user) return next(new Error("Invalid or expired session"));

    socket.data.userId = user.id;
    socket.data.user = user;
    next();
  });

  io.on("connection", (socket) => {
    const userId: string = socket.data.userId;

    socket.join(`user:${userId}`);
    socket.emit("presence:snapshot", presenceSnapshot());

    if (markOnline(userId)) {
      socket.broadcast.emit("presence:update", { userId, online: true });
    }

    socket.on("channel:join", (channelId: string) => {
      socket.join(`channel:${channelId}`);
    });

    socket.on("channel:leave", (channelId: string) => {
      socket.leave(`channel:${channelId}`);
    });

    socket.on("server:join", (serverId: string) => {
      socket.join(`server:${serverId}`);
    });

    socket.on("server:leave", (serverId: string) => {
      socket.leave(`server:${serverId}`);
    });

    socket.on("typing:start", ({ channelId }: { channelId: string }) => {
      socket.to(`channel:${channelId}`).emit("typing:start", {
        channelId,
        userId,
        username: socket.data.user.username,
        displayName: socket.data.user.displayName,
      });
    });

    socket.on("typing:stop", ({ channelId }: { channelId: string }) => {
      socket.to(`channel:${channelId}`).emit("typing:stop", {
        channelId,
        userId,
      });
    });

    socket.on("dm:typing:start", ({ threadId }: { threadId: string }) => {
      socket.to(`dm:${threadId}`).emit("dm:typing:start", {
        threadId,
        userId,
        username: socket.data.user.username,
        displayName: socket.data.user.displayName,
      });
    });

    socket.on("dm:typing:stop", ({ threadId }: { threadId: string }) => {
      socket.to(`dm:${threadId}`).emit("dm:typing:stop", { threadId, userId });
    });

    socket.on("dm:join", (threadId: string) => {
      socket.join(`dm:${threadId}`);
    });

    socket.on("dm:leave", (threadId: string) => {
      socket.leave(`dm:${threadId}`);
    });

    socket.on("disconnect", () => {
      if (markOffline(userId)) {
        socket.broadcast.emit("presence:update", { userId, online: false });
      }
    });
  });

  globalThis.__io = io;
  return io;
}

export function getIO(): SocketServer {
  if (!globalThis.__io) throw new Error("Socket.IO server not initialized");
  return globalThis.__io;
}

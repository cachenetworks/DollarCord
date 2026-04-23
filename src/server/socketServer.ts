import { Server as SocketServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { validateToken } from "../lib/auth";

// Global io instance shared with API routes
declare global {
  // eslint-disable-next-line no-var
  var __io: SocketServer | undefined;
}

export function initSocketServer(httpServer: HTTPServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Authenticate every socket connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Authentication required"));

    const user = await validateToken(token);
    if (!user) return next(new Error("Invalid or expired session"));

    socket.data.userId = user.id;
    socket.data.user = user;
    next();
  });

  io.on("connection", (socket) => {
    const userId: string = socket.data.userId;

    // Join personal notification room
    socket.join(`user:${userId}`);

    // Broadcast this user is online
    socket.broadcast.emit("presence:update", { userId, online: true });

    // ── Channel room management ──────────────────────────────────────────
    socket.on("channel:join", (channelId: string) => {
      socket.join(`channel:${channelId}`);
    });

    socket.on("channel:leave", (channelId: string) => {
      socket.leave(`channel:${channelId}`);
    });

    // ── Server room (for member list updates, new channels, etc.) ────────
    socket.on("server:join", (serverId: string) => {
      socket.join(`server:${serverId}`);
    });

    socket.on("server:leave", (serverId: string) => {
      socket.leave(`server:${serverId}`);
    });

    // ── Typing indicators (channels) ─────────────────────────────────────
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

    // ── Typing indicators (DMs) ──────────────────────────────────────────
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

    // ── DM room management ───────────────────────────────────────────────
    socket.on("dm:join", (threadId: string) => {
      socket.join(`dm:${threadId}`);
    });

    socket.on("dm:leave", (threadId: string) => {
      socket.leave(`dm:${threadId}`);
    });

    // ── Disconnect ───────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      socket.broadcast.emit("presence:update", { userId, online: false });
    });
  });

  globalThis.__io = io;
  return io;
}

/** Access the Socket.IO instance from API routes. */
export function getIO(): SocketServer {
  if (!globalThis.__io) throw new Error("Socket.IO server not initialized");
  return globalThis.__io;
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import type { PresenceMap } from "@/types";

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  presence: PresenceMap;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  presence: {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [presence, setPresence] = useState<PresenceMap>({});

  useEffect(() => {
    if (!token) return;

    const s = io(window.location.origin, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));

    s.on("presence:update", ({ userId, online }: { userId: string; online: boolean }) => {
      setPresence((prev) => ({ ...prev, [userId]: online }));
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected, presence }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}

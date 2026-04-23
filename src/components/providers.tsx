"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { ToastProvider } from "@/contexts/ToastContext";
import type { User } from "@/types";

interface Props {
  initialUser: User;
  children: React.ReactNode;
}

export function Providers({ initialUser, children }: Props) {
  return (
    <AuthProvider initialUser={initialUser}>
      <SocketProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

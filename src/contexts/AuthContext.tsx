"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface Props {
  initialUser?: User | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialUser = null, children }: Props) {
  const [user, setUser] = useState<User | null>(initialUser);
  // Token is stored in memory for socket auth; also in httpOnly cookie for API calls.
  const [token, setToken] = useState<string | null>(null);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setToken(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AppUser, Role } from "@/types";
import { isDemoMode } from "./env";

const STORAGE_KEY = "wdg.demo.user";

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  demo: boolean;
  signInDemo: (role: Role) => void;
  signInGoogle: () => Promise<void>;
  setActiveRole: (role: Role) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "김점주 (경영주)",
  PARTNER: "이고수 (협력사)",
  ADMIN: "박과장 (본부 관리자)",
  SUPER_ADMIN: "슈퍼관리자",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const persist = useCallback((u: AppUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const signInDemo = useCallback(
    (role: Role) => {
      // SUPER_ADMIN은 ADMIN 권한도 포함, OWNER는 기본 PARTNER 신청 가능
      const roles: Role[] =
        role === "SUPER_ADMIN" ? ["SUPER_ADMIN", "ADMIN", "OWNER"] : [role];
      persist({
        uid: `demo-${role.toLowerCase()}`,
        email: `${role.toLowerCase()}@demo.wooridongne.kr`,
        displayName: ROLE_LABEL[role],
        roles,
        activeRole: role,
      });
    },
    [persist]
  );

  const signInGoogle = useCallback(async () => {
    if (isDemoMode) {
      // 데모 모드에선 구글 로그인 대신 OWNER 데모 로그인
      signInDemo("OWNER");
      return;
    }
    const { getFirebaseAuth } = await import("./firebase");
    const auth = await getFirebaseAuth();
    if (!auth) return;
    const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    persist({
      uid: cred.user.uid,
      email: cred.user.email ?? "",
      displayName: cred.user.displayName ?? "사용자",
      roles: ["OWNER"],
      activeRole: "OWNER",
    });
  }, [persist, signInDemo]);

  const setActiveRole = useCallback(
    (role: Role) => {
      if (!user || !user.roles.includes(role)) return;
      persist({ ...user, activeRole: role });
    },
    [user, persist]
  );

  const signOut = useCallback(() => persist(null), [persist]);

  return (
    <AuthContext.Provider
      value={{ user, loading, demo: isDemoMode, signInDemo, signInGoogle, setActiveRole, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function roleHome(role: Role): string {
  switch (role) {
    case "PARTNER":
      return "/partner";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin";
    default:
      return "/owner";
  }
}

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

  // Firebase onAuthStateChanged 리스너 — 리다이렉트 로그인 결과 감지
  useEffect(() => {
    if (isDemoMode) return;

    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const { getFirebaseAuth } = await import("./firebase");
        const auth = await getFirebaseAuth();
        if (!auth) return;

        const { onAuthStateChanged } = await import("firebase/auth");
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            const appUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? "사용자",
              roles: ["OWNER"],
              activeRole: "OWNER",
            };
            setUser(appUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
          }
        });
      } catch (err) {
        console.error("[Auth] onAuthStateChanged 설정 실패:", err);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
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

    try {
      const { getFirebaseAuth } = await import("./firebase");
      const auth = await getFirebaseAuth();
      if (!auth) {
        console.error("[Auth] Firebase Auth 초기화 실패");
        alert("로그인 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } =
        await import("firebase/auth");
      const provider = new GoogleAuthProvider();

      try {
        // 팝업 로그인 시도
        const cred = await signInWithPopup(auth, provider);
        persist({
          uid: cred.user.uid,
          email: cred.user.email ?? "",
          displayName: cred.user.displayName ?? "사용자",
          roles: ["OWNER"],
          activeRole: "OWNER",
        });
      } catch (popupError: unknown) {
        const err = popupError as { code?: string; message?: string };
        console.warn("[Auth] 팝업 로그인 실패, 리다이렉트 시도:", err.code);

        if (
          err.code === "auth/popup-blocked" ||
          err.code === "auth/popup-closed-by-user" ||
          err.code === "auth/cancelled-popup-request"
        ) {
          // 팝업 차단 시 리다이렉트 방식으로 폴백
          await signInWithRedirect(auth, provider);
        } else if (err.code === "auth/unauthorized-domain") {
          alert(
            "이 도메인이 Firebase에 등록되지 않았습니다.\n" +
            "Firebase 콘솔 → Authentication → 설정 → 승인된 도메인에\n" +
            "현재 도메인을 추가해주세요."
          );
        } else {
          console.error("[Auth] Google 로그인 에러:", err);
          alert(`로그인 실패: ${err.message ?? err.code ?? "알 수 없는 오류"}`);
        }
      }
    } catch (err) {
      console.error("[Auth] 로그인 처리 중 에러:", err);
      alert("로그인 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
    }
  }, [persist, signInDemo]);

  const setActiveRole = useCallback(
    (role: Role) => {
      if (!user || !user.roles.includes(role)) return;
      persist({ ...user, activeRole: role });
    },
    [user, persist]
  );

  const handleSignOut = useCallback(async () => {
    // Firebase에서도 로그아웃
    if (!isDemoMode) {
      try {
        const { getFirebaseAuth } = await import("./firebase");
        const auth = await getFirebaseAuth();
        if (auth) {
          const { signOut: firebaseSignOut } = await import("firebase/auth");
          await firebaseSignOut(auth);
        }
      } catch (err) {
        console.error("[Auth] Firebase 로그아웃 에러:", err);
      }
    }
    persist(null);
  }, [persist]);

  return (
    <AuthContext.Provider
      value={{ user, loading, demo: isDemoMode, signInDemo, signInGoogle, setActiveRole, signOut: handleSignOut }}
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

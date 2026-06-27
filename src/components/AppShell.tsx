"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleHome } from "@/lib/auth";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { LoadingScreen } from "./LoadingScreen";
import type { Role } from "@/types";

// 인증 + 역할 가드. allow 미지정 시 로그인만 요구.
export function AppShell({
  title,
  allow,
  children,
}: {
  title: string;
  allow?: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allow && !user.roles.some((r) => allow.includes(r))) {
      router.replace(roleHome(user.activeRole));
    }
  }, [user, loading, allow, router]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <AppHeader title={title} />
      <main className="flex-1 px-4 pb-6 pt-2">{children}</main>
      <BottomNav />
    </div>
  );
}

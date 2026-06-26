"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui";
import { Bell, LogOut } from "lucide-react";

const ROLE_BADGE: Record<string, string> = {
  OWNER: "경영주",
  PARTNER: "협력사",
  ADMIN: "관리자",
  SUPER_ADMIN: "슈퍼관리자",
};

export function AppHeader({ title }: { title: string }) {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-base font-bold text-primary">우리동네고수</span>
        <span className="text-sm font-semibold text-ink">· {title}</span>
      </Link>
      <div className="flex items-center gap-2">
        {user && <Badge tone="primary">{ROLE_BADGE[user.activeRole]}</Badge>}
        <Link href="/notifications" aria-label="알림" className="rounded-lg p-2 hover:bg-slate-100">
          <Bell className="h-5 w-5 text-muted" />
        </Link>
        {user && (
          <button onClick={signOut} aria-label="로그아웃" className="rounded-lg p-2 hover:bg-slate-100">
            <LogOut className="h-5 w-5 text-muted" />
          </button>
        )}
      </div>
    </header>
  );
}

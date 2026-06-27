"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/types";
import { ChevronRight, FileText, Bell, Repeat } from "lucide-react";

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "경영주", PARTNER: "협력사", ADMIN: "관리자", SUPER_ADMIN: "슈퍼관리자",
  MENTOR: "멘토", LGU: "지자체", WORKER_GLOBAL: "글로벌워커",
};

export default function ProfilePage() {
  const { user, setActiveRole } = useAuth();
  if (!user) return null;

  return (
    <AppShell title="내 정보">
      <Card className="mt-3">
        <div className="text-lg font-bold text-ink">{user.displayName}</div>
        <div className="text-sm text-muted">{user.email}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {user.roles.map((r) => (
            <Badge key={r} tone={r === user.activeRole ? "primary" : "neutral"}>{ROLE_LABEL[r]}</Badge>
          ))}
        </div>
      </Card>

      {user.roles.length > 1 && (
        <>
          <h3 className="mb-2 mt-6 flex items-center gap-1.5 px-1 font-bold text-ink">
            <Repeat className="h-4 w-4" /> 역할 전환
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {user.roles.map((r) => (
              <Button
                key={r}
                variant={r === user.activeRole ? "primary" : "outline"}
                onClick={() => setActiveRole(r)}
              >
                {ROLE_LABEL[r]}
              </Button>
            ))}
          </div>
        </>
      )}

      <h3 className="mb-2 mt-6 px-1 font-bold text-ink">설정</h3>
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
        {[
          { href: "/notifications", label: "알림 설정", icon: Bell },
          { href: "/legal", label: "약관·개인정보·통신판매중개 고지", icon: FileText },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center justify-between border-b border-slate-100 p-4 last:border-0">
            <span className="flex items-center gap-3 text-sm text-ink">
              <Icon className="h-5 w-5 text-muted" /> {label}
            </span>
            <ChevronRight className="h-5 w-5 text-muted" />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

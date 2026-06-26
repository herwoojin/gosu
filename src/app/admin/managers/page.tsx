"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, Input } from "@/components/ui";
import { ShieldCheck, UserPlus } from "lucide-react";

const OWNERS = [
  { uid: "u-101", name: "정점주", email: "jung@store.kr", isAdmin: false },
  { uid: "u-102", name: "최점주", email: "choi@store.kr", isAdmin: true },
];

export default function AdminManagers() {
  const [admins, setAdmins] = useState<Record<string, boolean>>(
    Object.fromEntries(OWNERS.map((o) => [o.uid, o.isAdmin]))
  );
  const toggle = (uid: string) => setAdmins((a) => ({ ...a, [uid]: !a[uid] }));

  return (
    <AppShell title="관리자 지정" allow={["SUPER_ADMIN"]}>
      <Card className="mt-3 border border-primary/20 bg-primary-soft/50">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-bold">관리자 자가 승격 금지</span>
        </div>
        <p className="mt-1 text-xs text-muted">
          OWNER → ADMIN 승격은 슈퍼관리자만 가능하며, 모든 지정/회수는 감사로그에 기록됩니다.
        </p>
      </Card>

      <div className="mt-3">
        <Input placeholder="이름·이메일로 사용자 검색" />
      </div>

      <div className="mt-3 space-y-3">
        {OWNERS.map((o) => (
          <Card key={o.uid}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-ink">{o.name}</div>
                <div className="text-xs text-muted">{o.email}</div>
              </div>
              {admins[o.uid] ? (
                <Button variant="outline" onClick={() => toggle(o.uid)}>권한 회수</Button>
              ) : (
                <Button onClick={() => toggle(o.uid)}>
                  <UserPlus className="h-4 w-4" /> 관리자 지정
                </Button>
              )}
            </div>
            {admins[o.uid] && (
              <div className="mt-2">
                <Badge tone="primary">ADMIN</Badge>
              </div>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

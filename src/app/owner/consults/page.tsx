"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import { db } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { formatKRW, timeAgo } from "@/lib/utils";
import type { ConsultRequest, ConsultStatus } from "@/types";

const STATUS: Record<ConsultStatus, { label: string; tone: "neutral" | "warn" | "success" | "danger" | "primary" }> = {
  requested: { label: "요청 보냄", tone: "warn" },
  accepted: { label: "수락됨", tone: "primary" },
  scheduled: { label: "일정확정", tone: "primary" },
  completed: { label: "완료", tone: "success" },
  declined: { label: "거절됨", tone: "danger" },
};

export default function OwnerConsults() {
  const { user } = useAuth();
  const [list, setList] = useState<ConsultRequest[]>([]);

  useEffect(() => {
    if (!user) return;
    db.listConsultRequests({ ownerUid: user.uid === "demo-owner" ? "demo-owner" : user.uid }).then(setList);
  }, [user]);

  return (
    <AppShell title="내 컨설팅" allow={["OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <div className="mt-3 space-y-3">
        {list.map((r) => {
          const st = STATUS[r.status];
          return (
            <Card key={r.id}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">{r.partnerName}</span>
                <Badge tone={st.tone}>{st.label}</Badge>
              </div>
              <div className="mt-1">
                <Badge tone={r.mode === "free_as" ? "success" : "primary"}>
                  {r.mode === "free_as" ? "무료 AS" : `유료 출장 ${formatKRW(r.fee)}`}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted">{r.message}</p>
              <div className="mt-1 text-xs text-muted">{timeAgo(r.createdAt)}</div>
            </Card>
          );
        })}
        {list.length === 0 && <Card className="text-center text-sm text-muted">보낸 컨설팅 요청이 없습니다.</Card>}
      </div>
    </AppShell>
  );
}

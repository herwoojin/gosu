"use client";

import { AppShell } from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import { demoBids, demoRequests, categoryById } from "@/lib/demo-data";
import { formatKRW, timeAgo } from "@/lib/utils";

const STATUS: Record<string, { label: string; tone: "neutral" | "success" | "warn" | "danger" }> = {
  submitted: { label: "입찰중", tone: "warn" },
  awarded: { label: "낙찰", tone: "success" },
  rejected: { label: "유찰", tone: "neutral" },
  withdrawn: { label: "철회", tone: "neutral" },
};

export default function PartnerBids() {
  // 데모: p-1(한빛) 관점의 입찰 내역
  const myBids = demoBids.filter((b) => b.partnerId === "p-1" || b.partnerId === "p-3");
  return (
    <AppShell title="내 입찰" allow={["PARTNER"]}>
      <div className="mt-3 space-y-3">
        {myBids.map((b) => {
          const req = demoRequests.find((r) => r.id === b.requestId);
          const st = STATUS[b.status] ?? STATUS.submitted;
          return (
            <Card key={b.id}>
              <div className="flex items-center justify-between">
                <Badge tone="primary">{req ? categoryById(req.categoryId)?.name : "—"}</Badge>
                <Badge tone={st.tone}>{st.label}</Badge>
              </div>
              <div className="mt-2 text-sm font-bold text-ink">{req?.title}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted">{timeAgo(b.createdAt)} · {b.estSchedule}</span>
                <span className="text-base font-bold text-primary">{formatKRW(b.amount)}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

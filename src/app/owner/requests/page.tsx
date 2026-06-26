"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import { demoRequests, demoBids, categoryById } from "@/lib/demo-data";
import { timeAgo } from "@/lib/utils";
import { MapPin, Gavel } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  open: "입찰대기", bidding: "입찰중", awarded: "낙찰", in_progress: "작업중", completed: "완료",
};

export default function OwnerRequests() {
  return (
    <AppShell title="내 견적요청" allow={["OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <div className="mt-3 space-y-3">
        {demoRequests.map((r) => {
          const bidCount = demoBids.filter((b) => b.requestId === r.id).length;
          return (
            <Link key={r.id} href={`/owner/requests/${r.id}`}>
              <Card>
                <div className="flex items-center justify-between">
                  <Badge tone="primary">{categoryById(r.categoryId)?.name}</Badge>
                  <Badge tone={r.status === "bidding" ? "warn" : "neutral"}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
                </div>
                <div className="mt-2 text-sm font-bold text-ink">{r.title}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <MapPin className="h-3.5 w-3.5" /> {r.address} · {timeAgo(r.createdAt)}
                </div>
                <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3 text-sm font-semibold text-primary">
                  <Gavel className="h-4 w-4" /> 입찰 {bidCount}건 도착 — 비교하기
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}

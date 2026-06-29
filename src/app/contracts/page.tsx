"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { biddingDb } from "@/lib/bidding";
import { formatKRW, timeAgo } from "@/lib/utils";
import type { Contract } from "@/types/contract";
import { FileSignature, ChevronRight } from "lucide-react";

const STATUS: Record<Contract["status"], { label: string; tone: "neutral" | "primary" | "warn" | "success" | "danger" }> = {
  drafting: { label: "특약 작성", tone: "neutral" },
  partner_review: { label: "협력사 검토", tone: "primary" },
  revision_requested: { label: "수정 요청", tone: "warn" },
  signing: { label: "서명 진행", tone: "primary" },
  signed: { label: "체결 완료", tone: "success" },
  canceled: { label: "취소", tone: "danger" },
};

export default function ContractsPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Contract[]>([]);

  useEffect(() => {
    if (!user) return;
    const role = user.activeRole;
    // 협력사면 내 계약, 그 외(경영주/본부)는 전체(데모) — 본부담당자는 모든 계약 검토
    const filter = role === "PARTNER" || role === "MENTOR" ? { partnerUid: user.uid } : undefined;
    biddingDb.listContracts(filter).then(setList);
  }, [user]);

  return (
    <AppShell title="계약">
      <div className="mb-2 mt-3 flex items-center gap-1 px-1">
        <FileSignature className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-bold text-ink">내 계약 {list.length}건</h2>
      </div>
      <div className="space-y-2">
        {list.map((c) => (
          <Link key={c.id} href={`/contracts/${c.id}`}>
            <Card className="transition hover:ring-2 hover:ring-primary/30">
              <div className="flex items-center justify-between">
                <Badge tone="primary">{c.categoryName}</Badge>
                <Badge tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Badge>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-ink">{c.requestTitle}</div>
                  <div className="mt-0.5 text-xs text-muted">{c.partnerName} · {formatKRW(c.amount)} · {timeAgo(c.createdAt)}</div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
              </div>
            </Card>
          </Link>
        ))}
        {list.length === 0 && <Card className="text-center text-sm text-muted">아직 계약이 없습니다. 입찰 낙찰 시 계약이 생성됩니다.</Card>}
      </div>
    </AppShell>
  );
}

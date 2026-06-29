"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button } from "@/components/ui";
import { biddingDb } from "@/lib/bidding";
import { demoRequests, demoBids, categoryById } from "@/lib/demo-data";
import { formatKRW, timeAgo } from "@/lib/utils";
import { Star, Clock, MapPin, Briefcase, FileSignature } from "lucide-react";

type Sort = "price" | "rating";

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const request = demoRequests.find((r) => r.id === id);
  const [sort, setSort] = useState<Sort>("price");

  // 낙찰 → 경영주·본부담당자·협력사 3자 계약서 생성 후 이동
  const award = async (bidId: string) => {
    const b = demoBids.find((x) => x.id === bidId);
    if (!b || !request) return;
    const c = await biddingDb.createContract({
      requestId: request.id,
      requestTitle: request.title,
      categoryName: categoryById(request.categoryId)?.name ?? "공종",
      amount: b.amount,
      ownerUid: request.ownerUid,
      ownerName: "김점주 (경영주)",
      adminName: "박과장 (본부담당자)",
      partnerId: b.partnerId,
      partnerUid: b.partnerId,
      partnerName: b.partnerName,
    });
    router.push(`/contracts/${c.id}`);
  };

  const bids = useMemo(() => {
    const list = demoBids.filter((b) => b.requestId === id);
    return [...list].sort((a, b) => (sort === "price" ? a.amount - b.amount : b.partnerRating - a.partnerRating));
  }, [id, sort]);

  if (!request) {
    return (
      <AppShell title="견적요청" allow={["OWNER", "ADMIN", "SUPER_ADMIN"]}>
        <p className="mt-10 text-center text-muted">요청을 찾을 수 없습니다.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="입찰 비교" allow={["OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <Card className="mt-3">
        <Badge tone="primary">{categoryById(request.categoryId)?.name}</Badge>
        <h1 className="mt-2 text-lg font-bold text-ink">{request.title}</h1>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" /> {request.address}
        </div>
        {request.answers.detail && (
          <p className="mt-3 rounded-xl bg-bg p-3 text-sm text-ink">{request.answers.detail}</p>
        )}
      </Card>

      <div className="mb-3 mt-6 flex items-center justify-between px-1">
        <h2 className="text-lg font-bold">입찰 {bids.length}건</h2>
        <div className="flex overflow-hidden rounded-lg border border-slate-200 text-xs">
          {(["price", "rating"] as Sort[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 font-semibold ${sort === s ? "bg-primary text-white" : "bg-white text-muted"}`}
            >
              {s === "price" ? "낮은가격순" : "평점순"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {bids.map((b, i) => {
          const done = biddingDb.completedJobs(b.partnerId);
          return (
            <Card key={b.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">{b.partnerName}</span>
                    {i === 0 && sort === "price" && <Badge tone="success">최저가</Badge>}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-0.5 text-warn">
                      <Star className="h-3.5 w-3.5 fill-current" /> {b.partnerRating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-0.5 font-semibold text-primary">
                      <Briefcase className="h-3.5 w-3.5" /> 완료 {done}건
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3.5 w-3.5" /> {b.estSchedule}
                    </span>
                  </div>
                </div>
                <div className="text-right text-lg font-bold text-primary">{formatKRW(b.amount)}</div>
              </div>
              <p className="mt-2 text-sm text-ink">{b.message}</p>
              <div className="mt-1 text-[11px] text-muted">{timeAgo(b.createdAt)}</div>
              <Button className="mt-3 w-full" onClick={() => award(b.id)}>
                <FileSignature className="h-4 w-4" /> 낙찰 → 계약서 작성
              </Button>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

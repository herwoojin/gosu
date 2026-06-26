"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button } from "@/components/ui";
import { demoRequests, demoBids, categoryById } from "@/lib/demo-data";
import { formatKRW, timeAgo } from "@/lib/utils";
import { Star, Clock, MapPin, Phone, ShieldCheck, CreditCard, Building2 } from "lucide-react";

type Sort = "price" | "rating";

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const request = demoRequests.find((r) => r.id === id);
  const [sort, setSort] = useState<Sort>("price");
  const [awarded, setAwarded] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<"instant" | "hq" | null>(null);

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

      {awarded ? (
        <AwardPanel
          bid={bids.find((b) => b.id === awarded)!}
          payMethod={payMethod}
          setPayMethod={setPayMethod}
        />
      ) : (
        <>
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
            {bids.map((b, i) => (
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
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3.5 w-3.5" /> {b.estSchedule}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-lg font-bold text-primary">{formatKRW(b.amount)}</div>
                </div>
                <p className="mt-2 text-sm text-ink">{b.message}</p>
                <div className="mt-1 text-[11px] text-muted">{timeAgo(b.createdAt)}</div>
                <Button className="mt-3 w-full" onClick={() => setAwarded(b.id)}>
                  이 협력사에게 낙찰하기
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}

function AwardPanel({
  bid,
  payMethod,
  setPayMethod,
}: {
  bid: (typeof demoBids)[number];
  payMethod: "instant" | "hq" | null;
  setPayMethod: (m: "instant" | "hq") => void;
}) {
  return (
    <div className="mt-6 space-y-4">
      <Card className="border border-green-200 bg-green-50/40">
        <div className="flex items-center gap-2 text-success">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-bold">낙찰 완료 — {bid.partnerName}</span>
        </div>
        <p className="mt-2 text-sm text-ink">
          낙찰가 <b className="text-primary">{formatKRW(bid.amount)}</b> · {bid.estSchedule}
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-3 text-sm">
          <Phone className="h-4 w-4 text-primary" />
          <span className="font-semibold text-ink">연락처 공개:</span>
          <span className="text-muted">010-1234-5678</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          본 거래는 통신판매중개 거래로, 협력사의 자격·이행에 대한 최종 확인 책임은 이용자에게 있습니다.
        </p>
      </Card>

      <div>
        <h3 className="mb-2 px-1 font-bold text-ink">결제 방식 선택</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPayMethod("instant")}
            className={`rounded-2xl border p-4 text-left ${payMethod === "instant" ? "border-primary bg-primary-soft" : "border-slate-200 bg-white"}`}
          >
            <CreditCard className="h-6 w-6 text-primary" />
            <div className="mt-2 text-sm font-bold text-ink">즉시결제</div>
            <div className="text-xs text-muted">토스페이먼츠 · 에스크로</div>
          </button>
          <button
            onClick={() => setPayMethod("hq")}
            className={`rounded-2xl border p-4 text-left ${payMethod === "hq" ? "border-primary bg-primary-soft" : "border-slate-200 bg-white"}`}
          >
            <Building2 className="h-6 w-6 text-primary" />
            <div className="mt-2 text-sm font-bold text-ink">본부결제</div>
            <div className="text-xs text-muted">관리자 승인 후 직접지급</div>
          </button>
        </div>
        {payMethod && (
          <Card className="mt-3">
            <p className="text-sm text-ink">
              {payMethod === "instant"
                ? "토스페이먼츠 결제위젯으로 안전하게 결제됩니다. (데모: 실제 결제 미진행)"
                : "본부 시설담당자 승인 큐로 상신되었습니다. 승인 시 본부가 협력사에 직접 지급합니다."}
            </p>
            <Button className="mt-3 w-full" size="lg">
              {payMethod === "instant" ? "결제 진행" : "본부결제 상신"}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

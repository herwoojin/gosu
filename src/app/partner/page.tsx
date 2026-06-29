"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, Input, Textarea } from "@/components/ui";
import { DiscoverBanner } from "@/components/DiscoverBanner";
import { useAuth } from "@/lib/auth";
import { biddingDb } from "@/lib/bidding";
import { demoRequests, categoryById } from "@/lib/demo-data";
import { formatKRW, timeAgo } from "@/lib/utils";
import { MapPin, Clock, Send, Globe, ChevronRight, FileSignature, Briefcase, FileText } from "lucide-react";

const URGENCY: Record<string, { label: string; tone: "danger" | "warn" | "neutral" }> = {
  now: { label: "지금 바로", tone: "danger" },
  today: { label: "오늘 중", tone: "warn" },
  this_week: { label: "이번 주", tone: "neutral" },
  flexible: { label: "협의", tone: "neutral" },
};

export default function PartnerHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [bidFor, setBidFor] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (!user) return;
    biddingDb.isRegistered(user.uid).then(setRegistered);
    setCompleted(biddingDb.completedJobs(user.uid));
  }, [user]);

  // 입찰 제출 → 3자 계약 생성 후 계약서로 이동
  const submit = async (reqId: string) => {
    if (!user) return;
    const r = demoRequests.find((x) => x.id === reqId);
    if (!r) return;
    const c = await biddingDb.createContract({
      requestId: r.id,
      requestTitle: r.title,
      categoryName: categoryById(r.categoryId)?.name ?? "공종",
      amount: Number(amount) || 0,
      ownerUid: r.ownerUid,
      ownerName: "김점주 (경영주)",
      adminName: "박과장 (본부담당자)",
      partnerId: user.uid,
      partnerUid: user.uid,
      partnerName: registered ? user.displayName : user.displayName,
    });
    setBidFor(null);
    setAmount("");
    setMessage("");
    router.push(`/contracts/${c.id}`);
  };

  return (
    <AppShell title="협력사" allow={["PARTNER", "MENTOR"]}>
      <DiscoverBanner />

      {/* 협력사 등록 게이트 + 완료 작업 수 */}
      {registered === false ? (
        <Link href="/partner/register?next=/partner">
          <Card className="mt-3 flex items-center gap-3 border border-amber-200 bg-amber-50/60 transition hover:ring-2 hover:ring-amber-200">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700"><FileText className="h-6 w-6" /></span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-ink">협력사 정보 등록 (입찰 전 필수)</div>
              <div className="truncate text-xs text-muted">사업자등록증 · 업종 · 경력을 최초 1회 등록하세요</div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-amber-700" />
          </Card>
        </Link>
      ) : registered ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Card className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <div>
              <div className="text-base font-bold text-ink">{completed}건</div>
              <div className="text-[11px] text-muted">이 사이트 완료 작업</div>
            </div>
          </Card>
          <Link href="/contracts">
            <Card className="flex h-full items-center gap-2 transition hover:ring-2 hover:ring-primary/30">
              <FileSignature className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-bold text-ink">내 계약</div>
                <div className="text-[11px] text-muted">계약·서명 진행</div>
              </div>
            </Card>
          </Link>
        </div>
      ) : null}

      <Link href="/global">
        <Card className="mt-3 flex items-center gap-3 transition hover:ring-2 hover:ring-primary/30">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Globe className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-ink">글로벌 인재 찾기</div>
            <div className="truncate text-xs text-muted">입국 전 합법 사전 매칭 — 외국인 근로자 후보 보기</div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
        </Card>
      </Link>

      <div className="mt-5 flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-ink">내 공종·지역 매칭 일감</h2>
        <Badge tone="primary">{demoRequests.length}건</Badge>
      </div>

      <div className="mt-3 space-y-3">
        {demoRequests.map((r) => {
          const u = URGENCY[r.urgency];
          return (
            <Card key={r.id}>
              <div className="flex items-center justify-between">
                <Badge tone="primary">{categoryById(r.categoryId)?.name}</Badge>
                <Badge tone={u.tone}>{u.label}</Badge>
              </div>
              <div className="mt-2 text-sm font-bold text-ink">{r.title}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                <MapPin className="h-3.5 w-3.5" /> {r.address}
                <Clock className="ml-1 h-3.5 w-3.5" /> {timeAgo(r.createdAt)}
              </div>
              {r.answers.detail && <p className="mt-2 line-clamp-2 text-sm text-muted">{r.answers.detail}</p>}

              {bidFor === r.id ? (
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="입찰 금액(원)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Textarea
                    placeholder="고객에게 전할 메시지 (작업 범위·일정 등)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <p className="text-[11px] text-muted">입찰 제출 시 경영주·본부담당자·협력사 3자 계약서가 생성됩니다.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setBidFor(null)}>취소</Button>
                    <Button className="flex-[2]" disabled={!amount} onClick={() => submit(r.id)}>
                      <Send className="h-4 w-4" /> 입찰·계약 진행 {amount && `· ${formatKRW(Number(amount))}`}
                    </Button>
                  </div>
                </div>
              ) : registered === false ? (
                <Link href="/partner/register?next=/partner">
                  <Button className="mt-3 w-full" variant="outline">입찰하려면 협력사 정보 등록</Button>
                </Link>
              ) : (
                <Button className="mt-3 w-full" onClick={() => setBidFor(r.id)}>입찰하기</Button>
              )}
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

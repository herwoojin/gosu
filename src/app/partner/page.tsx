"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, Input, Textarea } from "@/components/ui";
import { DiscoverBanner } from "@/components/DiscoverBanner";
import { demoRequests, categoryById } from "@/lib/demo-data";
import { formatKRW, timeAgo } from "@/lib/utils";
import { MapPin, Clock, Send, Check, Globe, ChevronRight } from "lucide-react";

const URGENCY: Record<string, { label: string; tone: "danger" | "warn" | "neutral" }> = {
  now: { label: "지금 바로", tone: "danger" },
  today: { label: "오늘 중", tone: "warn" },
  this_week: { label: "이번 주", tone: "neutral" },
  flexible: { label: "협의", tone: "neutral" },
};

export default function PartnerHome() {
  const [bidFor, setBidFor] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const submit = (id: string) => {
    setSubmitted((s) => [...s, id]);
    setBidFor(null);
    setAmount("");
    setMessage("");
  };

  return (
    <AppShell title="협력사" allow={["PARTNER", "MENTOR"]}>
      <DiscoverBanner />

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
          const isSubmitted = submitted.includes(r.id);
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

              {isSubmitted ? (
                <div className="mt-3 flex items-center gap-1 rounded-xl bg-green-50 p-2.5 text-sm font-semibold text-success">
                  <Check className="h-4 w-4" /> 입찰을 제출했습니다
                </div>
              ) : bidFor === r.id ? (
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
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setBidFor(null)}>취소</Button>
                    <Button className="flex-[2]" disabled={!amount} onClick={() => submit(r.id)}>
                      <Send className="h-4 w-4" /> 입찰 제출 {amount && `· ${formatKRW(Number(amount))}`}
                    </Button>
                  </div>
                </div>
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

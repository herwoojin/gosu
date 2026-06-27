"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, LinkButton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { phase2db } from "@/lib/phase2";
import type { TrustScore, TrustGrade } from "@/types/phase2";
import { ShieldCheck, Smile, RefreshCw, Info, BadgeDollarSign } from "lucide-react";

const GRADE_TONE: Record<TrustGrade, "neutral" | "primary" | "success" | "warn"> = {
  새싹: "neutral", 일반: "neutral", 우수: "primary", 마스터: "success",
};

function ScoreBar({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted"><Icon className="h-3.5 w-3.5" /> {label}</span>
        <span className="font-bold text-ink">{value.toFixed(2)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${(value / 5) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

export default function TrustPage() {
  const { user } = useAuth();
  const [me, setMe] = useState<TrustScore | null>(null);
  const [all, setAll] = useState<TrustScore[]>([]);

  useEffect(() => {
    if (!user) return;
    phase2db.getTrustScore(user.uid).then(setMe);
    phase2db.listTrustScores().then((l) => setAll([...l].sort((a, b) => b.composite - a.composite)));
  }, [user]);

  return (
    <AppShell title="신뢰·친절·다시만나요">
      {me && (
        <Card className="mt-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-ink">{me.name}</div>
            <Badge tone={GRADE_TONE[me.grade]}>{me.grade} · 종합 ★{me.composite}</Badge>
          </div>
          <div className="mt-3 space-y-3">
            <ScoreBar icon={ShieldCheck} label="신뢰도" value={me.trust} color="#2563EB" />
            <ScoreBar icon={Smile} label="친절도" value={me.kindness} color="#16A34A" />
            <ScoreBar icon={RefreshCw} label="다시만나요(재의뢰)" value={me.again} color="#F59E0B" />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-primary-soft p-3">
            <span className="flex items-center gap-1 text-sm font-semibold text-primary"><BadgeDollarSign className="h-4 w-4" /> 권장 단가 배수</span>
            <span className="text-base font-bold text-primary">×{me.rateMultiplier.toFixed(2)}</span>
          </div>
          <p className="mt-2 flex items-start gap-1 text-[11px] text-muted">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            표본 {me.sampleCount}건 · 베이지안 평활 적용. 점수가 낮다고 생각되면 이의신청으로 재계산을 요청할 수 있습니다.
          </p>
          <button className="mt-2 w-full rounded-xl border border-slate-300 py-2 text-xs font-semibold text-ink" onClick={() => alert("이의신청이 접수되었습니다. (데모) 관리자 검토 후 재계산됩니다.")}>
            점수 이의신청 / 거짓후기 신고
          </button>
        </Card>
      )}

      <LinkButton href="/pricing-guide" variant="outline" className="mt-3 w-full">
        <BadgeDollarSign className="h-4 w-4" /> 단가 차등 가이드 보기
      </LinkButton>

      <h2 className="mb-2 mt-6 px-1 text-lg font-bold text-ink">고수 랭킹</h2>
      <div className="space-y-2">
        {all.map((s, i) => (
          <Card key={s.uid} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-sm font-bold text-muted">{i + 1}</span>
              <div>
                <div className="text-sm font-bold text-ink">{s.name}</div>
                <div className="text-xs text-muted">신뢰 {s.trust} · 친절 {s.kindness} · 재의뢰 {s.again}</div>
              </div>
            </div>
            <div className="text-right">
              <Badge tone={GRADE_TONE[s.grade]}>{s.grade}</Badge>
              <div className="mt-0.5 text-xs font-bold text-primary">×{s.rateMultiplier.toFixed(2)}</div>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-4 px-1 text-[11px] leading-relaxed text-muted">
        평가 공정성: 표본 수 공개, 이의신청·정정 절차 운영. 단가 차등은 권장 가이드이며 부당 차별을 금지합니다.
      </p>
    </AppShell>
  );
}

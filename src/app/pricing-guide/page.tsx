"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Input, Badge } from "@/components/ui";
import { RATE_MULTIPLIER } from "@/lib/phase2/engines";
import { formatKRW } from "@/lib/utils";
import type { TrustGrade } from "@/types/phase2";
import { BadgeDollarSign, TrendingUp, Info } from "lucide-react";

const GRADES: { grade: TrustGrade; range: string; why: string }[] = [
  { grade: "새싹", range: "종합 < 2.5", why: "신규·표본 부족. 기본 단가." },
  { grade: "일반", range: "2.5 ~ 3.5", why: "평균 수준의 신뢰·응대." },
  { grade: "우수", range: "3.5 ~ 4.3", why: "재의뢰율·친절도 우수. 분쟁 적음." },
  { grade: "마스터", range: "4.3 이상", why: "약속 이행·재구매 최상위. 하자·재방문 최소." },
];

export default function PricingGuidePage() {
  const [base, setBase] = useState("120000");
  const baseNum = Number(base) || 0;

  return (
    <AppShell title="단가 차등 가이드">
      <Card className="mt-2 bg-gradient-to-br from-primary to-blue-700 text-white">
        <div className="flex items-center gap-1 text-sm font-bold"><BadgeDollarSign className="h-4 w-4" /> 왜 고득점 고수에게 더 높은 단가를?</div>
        <p className="mt-1 text-xs leading-relaxed opacity-90">
          점수가 높은 고수는 <b>약속 이행·재방문 최소·분쟁 없음</b>으로 요청자의 총비용(재작업·시간 손실)을
          낮춥니다. 단가 배수는 이 가치를 데이터로 환산한 <b>권장값</b>입니다. (강제 아님)
        </p>
      </Card>

      {/* 계산기 */}
      <Card className="mt-3">
        <label className="mb-1 block text-sm font-semibold text-ink">기본 단가 입력</label>
        <Input type="number" inputMode="numeric" value={base} onChange={(e) => setBase(e.target.value)} />
        <div className="mt-3 space-y-2">
          {GRADES.map(({ grade }) => {
            const mult = RATE_MULTIPLIER[grade];
            const price = Math.round((baseNum * mult) / 1000) * 1000;
            const extra = price - baseNum;
            return (
              <div key={grade} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <Badge tone={grade === "마스터" ? "success" : grade === "우수" ? "primary" : "neutral"}>{grade}</Badge>
                  <span className="text-xs text-muted">×{mult.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-ink">{formatKRW(price)}</div>
                  {extra > 0 && <div className="flex items-center justify-end gap-0.5 text-[11px] text-success"><TrendingUp className="h-3 w-3" /> +{formatKRW(extra)}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <h2 className="mb-2 mt-6 px-1 text-lg font-bold text-ink">등급 기준</h2>
      <div className="space-y-2">
        {GRADES.map(({ grade, range, why }) => (
          <Card key={grade}>
            <div className="flex items-center justify-between">
              <Badge tone={grade === "마스터" ? "success" : grade === "우수" ? "primary" : "neutral"}>{grade}</Badge>
              <span className="text-xs text-muted">{range}</span>
            </div>
            <p className="mt-1.5 text-sm text-ink">{why}</p>
          </Card>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-1 px-1 text-[11px] leading-relaxed text-muted">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        종합점수 = 0.4·신뢰 + 0.3·친절 + 0.3·다시만나요 (베이지안 평활). 가중치·배수는 관리자가 조정할 수 있는 권장 가이드입니다.
      </p>
    </AppShell>
  );
}

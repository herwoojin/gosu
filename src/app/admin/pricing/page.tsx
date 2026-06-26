"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Select } from "@/components/ui";
import { categories } from "@/lib/demo-data";
import { formatKRW } from "@/lib/utils";

// 데모 집계치 (실서비스: 입찰/낙찰가 누적 집계 + 오피넷 참고치)
const PRICE: Record<string, { national: number; regional: number; current: number; samples: number }> = {
  "c-hvac-repair": { national: 105000, regional: 98000, current: 101000, samples: 412 },
  "c-hvac-clean": { national: 70000, regional: 65000, current: 68000, samples: 233 },
  "c-demolition": { national: 350000, regional: 320000, current: 340000, samples: 88 },
  "c-leak": { national: 150000, regional: 142000, current: 148000, samples: 121 },
};

export default function AdminPricing() {
  const [catId, setCatId] = useState("c-hvac-repair");
  const p = PRICE[catId] ?? { national: 0, regional: 0, current: 0, samples: 0 };
  const max = Math.max(p.national, p.regional, p.current, 1);

  const bars = [
    { label: "전국 평균", value: p.national, color: "bg-slate-400" },
    { label: "지방(서울) 평균", value: p.regional, color: "bg-primary" },
    { label: "현재 시세", value: p.current, color: "bg-success" },
  ];

  return (
    <AppShell title="단가 분석" allow={["ADMIN", "SUPER_ADMIN"]}>
      <Card className="mt-3">
        <label className="mb-1.5 block text-sm font-semibold text-ink">공종 선택</label>
        <Select value={catId} onChange={(e) => setCatId(e.target.value)}>
          {categories.filter((c) => PRICE[c.id]).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </Card>

      <Card className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-bold text-ink">전국 / 지방 / 현재 단가</span>
          <Badge tone="neutral">표본 {p.samples}건</Badge>
        </div>
        <div className="space-y-4">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted">{b.label}</span>
                <span className="font-bold text-ink">{formatKRW(b.value)}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${b.color}`} style={{ width: `${(b.value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="mt-3 px-1 text-[11px] leading-relaxed text-muted">
        제공되는 단가·표준인건비·유가 정보는 공개 출처 기반의 참고용이며 실제 거래가격을 보장하지 않습니다.
      </p>
    </AppShell>
  );
}

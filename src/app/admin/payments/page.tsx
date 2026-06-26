"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button } from "@/components/ui";
import { formatKRW } from "@/lib/utils";
import { Check, X } from "lucide-react";

const QUEUE = [
  { id: "hq-1", store: "서초점", category: "누수탐지", partner: "(주)클린에어 서비스", amount: 148000 },
];

export default function AdminPayments() {
  const [decided, setDecided] = useState<Record<string, "approved" | "rejected">>({});
  return (
    <AppShell title="본부결제 큐" allow={["ADMIN", "SUPER_ADMIN"]}>
      <p className="mt-3 px-1 text-xs text-muted">
        본부결제는 플랫폼이 자금을 보관·중계하지 않습니다. 승인 시 본부 회계가 협력사에 직접 지급합니다.
      </p>
      <div className="mt-3 space-y-3">
        {QUEUE.map((q) => {
          const d = decided[q.id];
          return (
            <Card key={q.id}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">{q.store} · {q.category}</span>
                {d && <Badge tone={d === "approved" ? "success" : "danger"}>{d === "approved" ? "승인" : "반려"}</Badge>}
              </div>
              <div className="mt-1 text-xs text-muted">{q.partner}</div>
              <div className="mt-2 text-lg font-bold text-primary">{formatKRW(q.amount)}</div>
              {!d && (
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="outline" className="flex-1" onClick={() => setDecided((s) => ({ ...s, [q.id]: "rejected" }))}>
                    <X className="h-4 w-4" /> 반려
                  </Button>
                  <Button className="flex-1" onClick={() => setDecided((s) => ({ ...s, [q.id]: "approved" }))}>
                    <Check className="h-4 w-4" /> 승인
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

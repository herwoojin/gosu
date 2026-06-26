"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button } from "@/components/ui";
import { demoPartners, categories } from "@/lib/demo-data";
import type { PartnerStatus } from "@/types";
import { ShieldCheck, ShieldAlert, Check, X } from "lucide-react";

const KIND_LABEL = { corporation: "법인", sole_proprietor: "개인사업자", individual: "무사업자" };

export default function AdminPartners() {
  const [statuses, setStatuses] = useState<Record<string, PartnerStatus>>(
    Object.fromEntries(demoPartners.map((p) => [p.id, p.status]))
  );

  const decide = (id: string, status: PartnerStatus) => setStatuses((s) => ({ ...s, [id]: status }));

  return (
    <AppShell title="협력사 승인" allow={["ADMIN", "SUPER_ADMIN"]}>
      <div className="mt-3 space-y-3">
        {demoPartners.map((p) => {
          const st = statuses[p.id];
          const catNames = p.categoryIds.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean);
          return (
            <Card key={p.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">{p.name}</span>
                    {p.bizVerified ? (
                      <span className="flex items-center gap-0.5 text-xs text-success">
                        <ShieldCheck className="h-3.5 w-3.5" /> 진위확인
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-xs text-warn">
                        <ShieldAlert className="h-3.5 w-3.5" /> 무사업자
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {KIND_LABEL[p.kind]} · {p.baseAddress} · 반경 {p.serviceRadiusM / 1000}km
                  </div>
                  <div className="mt-1 text-xs text-muted">{catNames.join(", ")}</div>
                </div>
                <Badge
                  tone={st === "approved" ? "success" : st === "rejected" ? "danger" : st === "suspended" ? "neutral" : "warn"}
                >
                  {st === "approved" ? "승인됨" : st === "rejected" ? "반려" : st === "suspended" ? "정지" : "대기"}
                </Badge>
              </div>

              {st === "pending" && (
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="outline" className="flex-1" onClick={() => decide(p.id, "rejected")}>
                    <X className="h-4 w-4" /> 반려
                  </Button>
                  <Button className="flex-1" onClick={() => decide(p.id, "approved")}>
                    <Check className="h-4 w-4" /> 승인
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <p className="mt-4 px-1 text-[11px] text-muted">
        승인/반려 결정은 감사로그(audit_logs)에 기록됩니다. 승인 전 협력사는 매칭에 노출되지 않습니다.
      </p>
    </AppShell>
  );
}

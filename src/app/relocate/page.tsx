"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { phase2db } from "@/lib/phase2";
import { formatKRW } from "@/lib/utils";
import type { RelocationProgram, RelocationApp, Voucher } from "@/types/phase2";
import { Bus, Home, Train, Plane, Car, Ticket, MapPin, Check } from "lucide-react";

export default function RelocatePage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<RelocationProgram[]>([]);
  const [apps, setApps] = useState<RelocationApp[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [applying, setApplying] = useState<RelocationProgram | null>(null);

  const reload = () => {
    if (!user) return;
    phase2db.listPrograms().then(setPrograms);
    phase2db.listRelocApps({ uid: user.uid }).then(setApps);
    phase2db.listVouchers(user.uid).then(setVouchers);
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [user]);

  const apply = async (p: RelocationProgram) => {
    if (!user) return;
    await phase2db.applyReloc({ uid: user.uid, applicantName: user.displayName, programId: p.id, programTitle: p.title });
    setApplying(null);
    reload();
  };

  const appliedIds = new Set(apps.map((a) => a.programId));

  return (
    <AppShell title="지방 이주·정착">
      <Card className="mt-2 flex items-center gap-2 bg-primary-soft">
        <Bus className="h-5 w-5 text-primary" />
        <p className="text-xs text-primary">지자체 협약 기반 <b>주거·교통 보조 + 온누리상품권</b>으로 지역에서 일하고 정착하세요.</p>
      </Card>

      {vouchers.length > 0 && (
        <Card className="mt-3 border border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-1 text-sm font-bold text-emerald-700"><Ticket className="h-4 w-4" /> 내 바우처</div>
          {vouchers.map((v) => (
            <div key={v.id} className="mt-1 flex items-center justify-between text-xs text-emerald-700">
              <span>{v.kind}</span><span className="font-bold">잔액 {formatKRW(v.balance)}</span>
            </div>
          ))}
        </Card>
      )}

      <h2 className="mb-2 mt-5 px-1 text-lg font-bold text-ink">모집 중인 프로그램</h2>
      <div className="space-y-3">
        {programs.map((p) => {
          const applied = appliedIds.has(p.id);
          return (
            <Card key={p.id}>
              <div className="flex items-center justify-between">
                <Badge tone="primary">{p.regionName}</Badge>
                <span className="text-xs text-muted">{p.periodStart} ~ {p.periodEnd}</span>
              </div>
              <div className="mt-2 text-sm font-bold text-ink">{p.title}</div>
              <div className="mt-1 text-xs text-muted">{p.orgName}</div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.benefits.housing && <Bene icon={Home}>{p.benefits.housing}</Bene>}
                {p.benefits.ktx && <Bene icon={Train}>KTX 보조</Bene>}
                {p.benefits.flight && <Bene icon={Plane}>항공 보조</Bene>}
                {p.benefits.car && <Bene icon={Car}>차편 보조</Bene>}
                {p.benefits.voucherAmount ? <Bene icon={Ticket}>온누리 {formatKRW(p.benefits.voucherAmount)}</Bene> : null}
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.targetJobs.map((j) => <span key={j} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-muted">{j}</span>)}
              </div>

              {applied ? (
                <div className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-green-50 py-2.5 text-sm font-semibold text-success"><Check className="h-4 w-4" /> 신청 완료 — 승인 대기</div>
              ) : applying?.id === p.id ? (
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setApplying(null)}>취소</Button>
                  <Button className="flex-[2]" onClick={() => apply(p)}>이주·일감 신청 확정</Button>
                </div>
              ) : (
                <Button className="mt-3 w-full" onClick={() => setApplying(p)}>이 프로그램 신청</Button>
              )}
            </Card>
          );
        })}
      </div>

      <p className="mt-4 px-1 text-[11px] leading-relaxed text-muted">
        ⚠️ 보조금·온누리상품권 실지급/정산은 지자체·소상공인시장진흥공단 절차를 따르며, 플랫폼은 신청·승인·사용 기록만 관리합니다(자금 미보관). 협약·법령 준수 및 전문가 검토 전제.
      </p>
    </AppShell>
  );
}

function Bene({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
      <Icon className="h-3 w-3" /> {children}
    </span>
  );
}

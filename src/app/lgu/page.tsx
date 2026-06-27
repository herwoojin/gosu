"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { phase2db } from "@/lib/phase2";
import { demoStore } from "@/lib/demo-data";
import { formatKRW } from "@/lib/utils";
import type { RelocationProgram, RelocationApp } from "@/types/phase2";
import { Building2, Plus, Users, Check, Ticket, BarChart3 } from "lucide-react";

export default function LguPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<RelocationProgram[]>([]);
  const [apps, setApps] = useState<RelocationApp[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ orgName: "", regionName: "", title: "", voucher: "300000", jobs: "" });

  const reload = () => {
    phase2db.listPrograms().then(setPrograms);
    phase2db.listRelocApps().then(setApps);
  };
  useEffect(() => { reload(); }, []);

  const create = async () => {
    if (!user || !form.title) return;
    await phase2db.createProgram({
      lguId: user.uid, orgName: form.orgName || "지자체", regionName: form.regionName || "지역",
      regionCode: "00000", geo: demoStore.geo, title: form.title,
      benefits: { housing: "임시거처 제공", ktx: true, voucherAmount: Number(form.voucher) || 0 },
      targetJobs: form.jobs.split(",").map((s) => s.trim()).filter(Boolean),
      periodStart: "2026-07-01", periodEnd: "2026-12-31",
    });
    setOpen(false);
    setForm({ orgName: "", regionName: "", title: "", voucher: "300000", jobs: "" });
    reload();
  };

  const approveAndIssue = async (a: RelocationApp) => {
    await phase2db.approveReloc(a.id);
    const prog = programs.find((p) => p.id === a.programId);
    const amount = prog?.benefits.voucherAmount ?? 0;
    if (amount > 0) await phase2db.issueVoucher({ uid: a.uid, programId: a.programId, amount });
    reload();
  };

  const pending = apps.filter((a) => a.status === "applied");
  const approved = apps.filter((a) => a.status !== "applied");

  return (
    <AppShell title="지자체 협약 관리" allow={["LGU", "ADMIN", "SUPER_ADMIN"]}>
      {/* 성과 요약 */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        <Stat icon={Building2} label="프로그램" value={programs.length} />
        <Stat icon={Users} label="신청" value={apps.length} />
        <Stat icon={Check} label="승인" value={approved.length} />
      </div>

      {!open && <Button className="mt-3 w-full" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> 이주 프로그램 등록</Button>}
      {open && (
        <Card className="mt-3 space-y-2">
          <Input placeholder="기관명 (예: 전남 강진군)" value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })} />
          <Input placeholder="지역명 (예: 전남 강진)" value={form.regionName} onChange={(e) => setForm({ ...form, regionName: e.target.value })} />
          <Input placeholder="프로그램 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input type="number" inputMode="numeric" placeholder="온누리상품권 발급액(원)" value={form.voucher} onChange={(e) => setForm({ ...form, voucher: e.target.value })} />
          <Input placeholder="모집 직무 (쉼표 구분)" value={form.jobs} onChange={(e) => setForm({ ...form, jobs: e.target.value })} />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>취소</Button>
            <Button className="flex-[2]" onClick={create}>등록</Button>
          </div>
        </Card>
      )}

      {/* 신청 승인 */}
      <h2 className="mb-2 mt-6 px-1 text-lg font-bold text-ink">신청 승인 대기 ({pending.length})</h2>
      <div className="space-y-2">
        {pending.map((a) => (
          <Card key={a.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-ink">{a.applicantName}</div>
              <div className="text-xs text-muted">{a.programTitle}</div>
            </div>
            <Button size="md" onClick={() => approveAndIssue(a)}><Ticket className="h-4 w-4" /> 승인+바우처</Button>
          </Card>
        ))}
        {pending.length === 0 && <Card className="text-center text-sm text-muted">대기 중인 신청이 없습니다.</Card>}
      </div>

      {/* 내 프로그램 */}
      <h2 className="mb-2 mt-6 px-1 text-lg font-bold text-ink">등록 프로그램</h2>
      <div className="space-y-2">
        {programs.map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-ink">{p.title}</div>
              <div className="text-xs text-muted">{p.regionName} · 온누리 {formatKRW(p.benefits.voucherAmount ?? 0)}</div>
            </div>
            <Badge tone="success">운영중</Badge>
          </Card>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-1 px-1 text-[11px] leading-relaxed text-muted">
        <BarChart3 className="mt-0.5 h-3 w-3 shrink-0" />
        성과 리포트는 익명 통계로 제공됩니다. 바우처는 부정유통(중복·전매) 탐지 메타와 함께 발급되며 플랫폼은 자금을 보관하지 않습니다.
      </p>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <Card className="text-center">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <div className="mt-1 text-lg font-bold text-ink">{value}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </Card>
  );
}

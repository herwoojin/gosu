"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, Input, Textarea } from "@/components/ui";
import { db } from "@/lib/data";
import { demoPartners } from "@/lib/demo-data";
import { formatKRW, timeAgo } from "@/lib/utils";
import type { ConsultingOptions, ConsultRequest, ConsultStatus, PartnerProfile } from "@/types";
import { HeartHandshake, Car, Check, X, Calendar, CheckCircle2 } from "lucide-react";

// 데모: 로그인 협력사를 p-1(한빛)로 매핑
const DEMO_PARTNER_ID = "p-1";

const STATUS: Record<ConsultStatus, { label: string; tone: "neutral" | "warn" | "success" | "danger" | "primary" }> = {
  requested: { label: "요청 도착", tone: "warn" },
  accepted: { label: "수락함", tone: "primary" },
  scheduled: { label: "일정확정", tone: "primary" },
  completed: { label: "완료", tone: "success" },
  declined: { label: "거절", tone: "danger" },
};

export default function PartnerConsulting() {
  const base = demoPartners.find((p) => p.id === DEMO_PARTNER_ID) as PartnerProfile;
  const [opts, setOpts] = useState<ConsultingOptions>(base.consulting);
  const [savedFlash, setSavedFlash] = useState(false);
  const [requests, setRequests] = useState<ConsultRequest[]>([]);

  const reload = () => db.listConsultRequests({ partnerId: DEMO_PARTNER_ID }).then(setRequests);
  useEffect(() => { reload(); }, []);

  const saveOpts = async (next: ConsultingOptions) => {
    setOpts(next);
    await db.savePartnerConsulting(DEMO_PARTNER_ID, next);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  const setStatus = async (id: string, status: ConsultStatus) => {
    await db.updateConsultStatus(id, status);
    reload();
  };

  return (
    <AppShell title="컨설팅 관리" allow={["PARTNER"]}>
      <h2 className="mb-2 mt-3 px-1 text-lg font-bold text-ink">제공 옵션</h2>
      <Card>
        <ToggleRow
          icon={HeartHandshake}
          title="무료 AS 컨설팅"
          desc="전화·사진·원격으로 무료 진단 제공"
          on={opts.offersFreeAs}
          onToggle={() => saveOpts({ ...opts, offersFreeAs: !opts.offersFreeAs })}
        />
        <div className="my-3 border-t border-slate-100" />
        <ToggleRow
          icon={Car}
          title="유료 출장 컨설팅"
          desc="현장 방문 정밀진단 (요금 설정)"
          on={opts.offersPaidVisit}
          onToggle={() => saveOpts({ ...opts, offersPaidVisit: !opts.offersPaidVisit })}
        />
        {opts.offersPaidVisit && (
          <div className="mt-3">
            <label className="mb-1.5 block text-sm font-semibold text-ink">출장 기본 요금(원)</label>
            <Input
              type="number"
              inputMode="numeric"
              value={String(opts.visitFee)}
              onChange={(e) => setOpts({ ...opts, visitFee: Number(e.target.value) })}
              onBlur={() => saveOpts(opts)}
            />
          </div>
        )}
        <label className="mb-1.5 mt-3 block text-sm font-semibold text-ink">안내 문구</label>
        <Textarea
          value={opts.note ?? ""}
          onChange={(e) => setOpts({ ...opts, note: e.target.value })}
          onBlur={() => saveOpts(opts)}
          placeholder="예: 전화 무료 진단 후 필요 시 출장 점검합니다."
        />
        {savedFlash && <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-success"><Check className="h-3.5 w-3.5" /> 저장됨</div>}
      </Card>

      <h2 className="mb-2 mt-6 px-1 text-lg font-bold text-ink">받은 컨설팅 요청 {requests.length}건</h2>
      <div className="space-y-3">
        {requests.map((r) => {
          const st = STATUS[r.status];
          return (
            <Card key={r.id}>
              <div className="flex items-center justify-between">
                <Badge tone={r.mode === "free_as" ? "success" : "primary"}>
                  {r.mode === "free_as" ? "무료 AS" : `유료 출장 ${formatKRW(r.fee)}`}
                </Badge>
                <Badge tone={st.tone}>{st.label}</Badge>
              </div>
              <p className="mt-2 text-sm text-ink">{r.message || "(요청 메시지 없음)"}</p>
              <div className="mt-1 text-xs text-muted">
                {r.preferredTime ? `희망: ${r.preferredTime} · ` : ""}{timeAgo(r.createdAt)}
              </div>
              {r.status === "requested" && (
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStatus(r.id, "declined")}>
                    <X className="h-4 w-4" /> 거절
                  </Button>
                  <Button className="flex-1" onClick={() => setStatus(r.id, "accepted")}>
                    <Check className="h-4 w-4" /> 수락
                  </Button>
                </div>
              )}
              {r.status === "accepted" && (
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStatus(r.id, "scheduled")}>
                    <Calendar className="h-4 w-4" /> 일정확정
                  </Button>
                  <Button className="flex-1" onClick={() => setStatus(r.id, "completed")}>
                    <CheckCircle2 className="h-4 w-4" /> 완료처리
                  </Button>
                </div>
              )}
              {r.status === "scheduled" && (
                <Button className="mt-3 w-full" onClick={() => setStatus(r.id, "completed")}>
                  <CheckCircle2 className="h-4 w-4" /> 컨설팅 완료
                </Button>
              )}
            </Card>
          );
        })}
        {requests.length === 0 && <Card className="text-center text-sm text-muted">아직 받은 요청이 없습니다.</Card>}
      </div>
    </AppShell>
  );
}

function ToggleRow({
  icon: Icon, title, desc, on, onToggle,
}: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></span>
        <div>
          <div className="text-sm font-bold text-ink">{title}</div>
          <div className="text-xs text-muted">{desc}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative h-7 w-12 rounded-full transition ${on ? "bg-primary" : "bg-slate-300"}`}
        aria-pressed={on}
      >
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

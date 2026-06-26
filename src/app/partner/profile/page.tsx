"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, Input, Select } from "@/components/ui";
import { categories } from "@/lib/demo-data";
import type { PartnerKind } from "@/types";
import { cn } from "@/lib/utils";
import { ShieldCheck, Loader2, Upload, Check } from "lucide-react";

const KINDS: { kind: PartnerKind; label: string; desc: string }[] = [
  { kind: "corporation", label: "법인사업자", desc: "사업자등록 진위확인" },
  { kind: "sole_proprietor", label: "개인사업자", desc: "사업자등록 진위확인" },
  { kind: "individual", label: "무사업자 숙련공", desc: "신원·자격·평가 기반" },
];

export default function PartnerProfile() {
  const [kind, setKind] = useState<PartnerKind>("sole_proprietor");
  const [bizNo, setBizNo] = useState("");
  const [verify, setVerify] = useState<"idle" | "loading" | "ok" | "fail">("idle");
  const [cats, setCats] = useState<string[]>(["c-hvac-repair"]);

  const toggleCat = (id: string) =>
    setCats((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const runVerify = async () => {
    setVerify("loading");
    // 데모: 실제로는 verify-biz Edge Function(국세청) 호출. 끝 4자리 0000이면 폐업 가정.
    await new Promise((r) => setTimeout(r, 900));
    setVerify(bizNo.replace(/\D/g, "").length === 10 && !bizNo.endsWith("0000") ? "ok" : "fail");
  };

  const needBiz = kind !== "individual";

  return (
    <AppShell title="협력사 프로필" allow={["PARTNER"]}>
      <Card className="mt-3 border border-amber-200 bg-amber-50/40">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-ink">승인 상태</span>
          <Badge tone="warn">승인 대기</Badge>
        </div>
        <p className="mt-1 text-xs text-muted">관리자 승인 전에는 매칭에 노출되지 않습니다.</p>
      </Card>

      <h3 className="mb-2 mt-6 px-1 font-bold text-ink">등록 트랙</h3>
      <div className="space-y-2">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            onClick={() => setKind(k.kind)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border p-3 text-left",
              kind === k.kind ? "border-primary bg-primary-soft" : "border-slate-200 bg-white"
            )}
          >
            <span>
              <span className="block text-sm font-semibold text-ink">{k.label}</span>
              <span className="block text-xs text-muted">{k.desc}</span>
            </span>
            {kind === k.kind && <Check className="h-5 w-5 text-primary" />}
          </button>
        ))}
      </div>

      {needBiz && (
        <Card className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-ink">사업자등록번호</label>
          <div className="flex gap-2">
            <Input placeholder="000-00-00000" value={bizNo} onChange={(e) => setBizNo(e.target.value)} />
            <Button onClick={runVerify} disabled={verify === "loading"}>
              {verify === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "진위확인"}
            </Button>
          </div>
          {verify === "ok" && (
            <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-success">
              <ShieldCheck className="h-4 w-4" /> 국세청 확인 완료 (계속사업자)
            </div>
          )}
          {verify === "fail" && (
            <div className="mt-2 text-sm font-semibold text-danger">확인 실패 — 폐업/휴업 또는 잘못된 번호입니다.</div>
          )}
          <p className="mt-2 text-[11px] text-muted">
            입력하신 번호는 국세청 진위확인 서비스로 검증됩니다. 허위 등록 시 이용이 제한됩니다.
          </p>
        </Card>
      )}

      {kind === "individual" && (
        <p className="mt-3 px-1 text-[11px] leading-relaxed text-muted">
          사업자등록이 없는 개인은 지급액에 대해 사업소득 3.3% 원천징수가 적용될 수 있으며, 지급명세서가 작성될 수 있습니다.
        </p>
      )}

      <h3 className="mb-2 mt-6 px-1 font-bold text-ink">대표 공종 (복수 선택)</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => toggleCat(c.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-semibold",
              cats.includes(c.id) ? "border-primary bg-primary text-white" : "border-slate-300 bg-white text-muted"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <h3 className="mb-2 mt-6 px-1 font-bold text-ink">서비스 지역 · 자격증</h3>
      <Card>
        <label className="mb-1.5 block text-sm font-semibold text-ink">기준 주소</label>
        <Input placeholder="도로명 주소 검색" />
        <label className="mb-1.5 mt-3 block text-sm font-semibold text-ink">서비스 반경</label>
        <Select defaultValue="20000">
          <option value="10000">10km</option>
          <option value="20000">20km</option>
          <option value="30000">30km</option>
          <option value="50000">50km</option>
        </Select>
        <label className="mt-3 flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-muted">
          <Upload className="h-6 w-6" />
          <span className="text-xs">자격증·보험·포트폴리오 업로드</span>
          <input type="file" multiple className="hidden" />
        </label>
      </Card>

      <Button size="lg" className="mt-5 w-full" disabled={needBiz && verify !== "ok"}>
        승인 요청 제출
      </Button>
    </AppShell>
  );
}

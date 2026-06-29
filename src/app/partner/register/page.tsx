"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Button, Input, Textarea } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { biddingDb } from "@/lib/bidding";
import { categories } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import type { PartnerKind, CareerEntry } from "@/types/contract";
import { ShieldCheck, Loader2, Upload, Check, Plus, Trash2, FileText } from "lucide-react";

const KINDS: { kind: PartnerKind; label: string; desc: string }[] = [
  { kind: "corporation", label: "법인사업자", desc: "사업자등록증 + 진위확인" },
  { kind: "sole_proprietor", label: "개인사업자", desc: "사업자등록증 + 진위확인" },
  { kind: "individual", label: "무사업자 숙련공", desc: "신원·자격·경력 기반" },
];

export default function RegisterPage() {
  return (
    <Suspense fallback={<AppShell title="협력사 정보 등록"><div className="mt-6 text-center text-sm text-muted">불러오는 중…</div></AppShell>}>
      <RegisterInner />
    </Suspense>
  );
}

function RegisterInner() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/partner";

  const [kind, setKind] = useState<PartnerKind>("sole_proprietor");
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [bizNo, setBizNo] = useState("");
  const [bizFile, setBizFile] = useState("");
  const [verify, setVerify] = useState<"idle" | "loading" | "ok" | "fail">("idle");
  const [address, setAddress] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [careers, setCareers] = useState<CareerEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 기존 등록 정보 불러오기(수정 모드)
  useEffect(() => {
    if (!user) return;
    biddingDb.getRegistration(user.uid).then((r) => {
      if (r) {
        setKind(r.kind); setCompanyName(r.companyName); setOwnerName(r.ownerName);
        setPhone(r.phone); setBizNo(r.bizRegNo); setBizFile(r.bizRegFileName);
        setVerify(r.bizVerified ? "ok" : "idle"); setAddress(r.baseAddress);
        setCats(r.categoryIds); setCareers(r.careers);
      } else {
        setOwnerName(user.displayName);
      }
      setLoaded(true);
    });
  }, [user]);

  const needBiz = kind !== "individual";
  const toggleCat = (id: string) => setCats((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const runVerify = async () => {
    setVerify("loading");
    await new Promise((r) => setTimeout(r, 800));
    setVerify(bizNo.replace(/\D/g, "").length === 10 && !bizNo.endsWith("0000") ? "ok" : "fail");
  };

  const addCareer = () => setCareers((c) => [...c, { id: `cr-${Date.now()}`, field: "", years: 1, description: "" }]);
  const setCareer = (id: string, patch: Partial<CareerEntry>) =>
    setCareers((c) => c.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeCareer = (id: string) => setCareers((c) => c.filter((e) => e.id !== id));

  const canSubmit =
    companyName.trim() &&
    ownerName.trim() &&
    cats.length > 0 &&
    (!needBiz || (verify === "ok" && bizFile));

  const submit = async () => {
    if (!user || !canSubmit) return;
    await biddingDb.saveRegistration({
      uid: user.uid, kind, companyName, ownerName, phone,
      bizRegNo: needBiz ? bizNo : "", bizVerified: needBiz ? verify === "ok" : true,
      bizRegFileName: bizFile, baseAddress: address, categoryIds: cats, careers,
      registeredAt: "",
    });
    router.replace(next);
  };

  if (!loaded) return <AppShell title="협력사 정보 등록"><div className="mt-6 text-center text-sm text-muted">불러오는 중…</div></AppShell>;

  return (
    <AppShell title="협력사 정보 등록" allow={["PARTNER", "MENTOR"]}>
      <Card className="mt-2 flex items-start gap-2 bg-primary-soft">
        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-xs text-primary">입찰 전 <b>최초 1회</b> 협력사 정보를 등록해야 합니다. 사업자등록증·업종·경력은 경영주/본부에 신뢰 정보로 제공됩니다.</p>
      </Card>

      {/* 사업자 구분 */}
      <h3 className="mb-2 mt-5 px-1 font-bold text-ink">사업자 구분</h3>
      <div className="space-y-2">
        {KINDS.map((k) => (
          <button key={k.kind} onClick={() => setKind(k.kind)}
            className={cn("flex w-full items-center justify-between rounded-xl border p-3 text-left", kind === k.kind ? "border-primary bg-primary-soft" : "border-slate-200 bg-white")}>
            <span>
              <span className="block text-sm font-semibold text-ink">{k.label}</span>
              <span className="block text-xs text-muted">{k.desc}</span>
            </span>
            {kind === k.kind && <Check className="h-5 w-5 text-primary" />}
          </button>
        ))}
      </div>

      {/* 기본 정보 */}
      <h3 className="mb-2 mt-5 px-1 font-bold text-ink">기본 정보</h3>
      <Card className="space-y-2">
        <Input placeholder="상호명 / 팀명" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        <Input placeholder="대표자명" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
        <Input placeholder="연락처 010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input placeholder="기준 주소(도로명)" value={address} onChange={(e) => setAddress(e.target.value)} />
      </Card>

      {/* 사업자등록증 */}
      {needBiz && (
        <>
          <h3 className="mb-2 mt-5 px-1 font-bold text-ink">사업자등록증</h3>
          <Card>
            <label className="mb-1.5 block text-sm font-semibold text-ink">사업자등록번호</label>
            <div className="flex gap-2">
              <Input placeholder="000-00-00000" value={bizNo} onChange={(e) => { setBizNo(e.target.value); setVerify("idle"); }} />
              <Button onClick={runVerify} disabled={verify === "loading"}>
                {verify === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "진위확인"}
              </Button>
            </div>
            {verify === "ok" && <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-success"><ShieldCheck className="h-4 w-4" /> 국세청 확인 완료 (계속사업자)</div>}
            {verify === "fail" && <div className="mt-2 text-sm font-semibold text-danger">확인 실패 — 폐업/휴업 또는 잘못된 번호입니다.</div>}

            <label className={cn("mt-3 flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-muted", bizFile ? "border-success bg-green-50/40 text-success" : "border-slate-300")}>
              {bizFile ? <Check className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
              <span className="text-xs">{bizFile || "사업자등록증 사본 업로드"}</span>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setBizFile(e.target.files?.[0]?.name ?? "")} />
            </label>
          </Card>
        </>
      )}

      {/* 업종 */}
      <h3 className="mb-2 mt-5 px-1 font-bold text-ink">업종 (복수 선택)</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c.id} onClick={() => toggleCat(c.id)}
            className={cn("rounded-full border px-3 py-1.5 text-sm font-semibold", cats.includes(c.id) ? "border-primary bg-primary text-white" : "border-slate-300 bg-white text-muted")}>
            {c.name}
          </button>
        ))}
      </div>

      {/* 경력 */}
      <div className="mb-2 mt-5 flex items-center justify-between px-1">
        <h3 className="font-bold text-ink">경력</h3>
        <button onClick={addCareer} className="flex items-center gap-1 text-sm font-semibold text-primary"><Plus className="h-4 w-4" /> 추가</button>
      </div>
      <div className="space-y-2">
        {careers.map((e) => (
          <Card key={e.id} className="space-y-2">
            <div className="flex gap-2">
              <Input placeholder="분야 (예: 냉난방 설비)" value={e.field} onChange={(ev) => setCareer(e.id, { field: ev.target.value })} />
              <div className="flex items-center gap-1">
                <Input type="number" inputMode="numeric" className="w-20 text-center" value={String(e.years)} onChange={(ev) => setCareer(e.id, { years: Number(ev.target.value) || 0 })} />
                <span className="text-sm text-muted">년</span>
              </div>
              <button onClick={() => removeCareer(e.id)} className="px-1 text-muted"><Trash2 className="h-4 w-4" /></button>
            </div>
            <Textarea className="min-h-16" placeholder="주요 경력·시공 이력" value={e.description} onChange={(ev) => setCareer(e.id, { description: ev.target.value })} />
          </Card>
        ))}
        {careers.length === 0 && <p className="px-1 text-xs text-muted">경력을 추가하면 입찰 시 신뢰도가 올라갑니다.</p>}
      </div>

      <Button size="lg" className="mt-6 w-full" disabled={!canSubmit} onClick={submit}>등록 완료</Button>
      {!canSubmit && <p className="mt-2 px-1 text-center text-[11px] text-muted">상호명·대표자·업종{needBiz && " · 사업자등록증 진위확인·파일"}을 완료해주세요.</p>}
    </AppShell>
  );
}

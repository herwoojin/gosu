"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { phase2db } from "@/lib/phase2";
import type { GlobalWorkerProfile, RelocationProgram } from "@/types/phase2";
import { Globe, ShieldCheck, ShieldAlert, ExternalLink, Languages, MapPin, Check, Search, Phone } from "lucide-react";

// 간단 i18n (한/영) — 확장형 구조의 데모
const T = {
  ko: {
    title: "글로벌 워커 매칭", lead: "입국 전에 어느 지역에서 어떤 일을 합법적으로 할 수 있는지 미리 확인하세요.",
    profile: "내 프로필", visa: "비자 / 고용허가 안내", checklist: "요건 체크리스트", matched: "추천 지역·일감",
    langs: "언어", verified: "검증 완료", unverified: "검증 필요",
    apply: "이 지역 신청", dirTitle: "글로벌 인재 후보", dirLead: "입국 전 합법 사전 매칭 — 신원·언어·비자 확인된 후보입니다.",
    contact: "사전 컨택", desiredJobs: "희망 직무", desiredRegions: "희망 지역",
  },
  en: {
    title: "Global Worker Matching", lead: "Check legally available jobs and regions before you arrive in Korea.",
    profile: "My Profile", visa: "Visa / Work Permit Guide", checklist: "Eligibility Checklist", matched: "Recommended Regions & Jobs",
    langs: "Languages", verified: "Verified", unverified: "Verification needed",
    apply: "Apply to this region", dirTitle: "Global Talent Candidates", dirLead: "Legal pre-arrival matching — identity, language and visa checked.",
    contact: "Pre-contact", desiredJobs: "Desired jobs", desiredRegions: "Desired regions",
  },
};

const OFFICIAL = [
  { label: "하이코리아 (HiKorea, 출입국)", url: "https://www.hikorea.go.kr" },
  { label: "고용허가제 EPS", url: "https://www.eps.go.kr" },
];

export default function GlobalPage() {
  const { user } = useAuth();
  const [lang, setLang] = useState<"ko" | "en">("ko");
  const t = T[lang];

  // 본인이 글로벌 워커면 자기 프로필 화면, 아니면(협력사/관리자/경영주) 후보 디렉터리
  const isWorker = user?.activeRole === "WORKER_GLOBAL";

  return (
    <AppShell title={t.title} allow={["WORKER_GLOBAL", "PARTNER", "MENTOR", "ADMIN", "SUPER_ADMIN", "OWNER"]}>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-xs text-muted"><Globe className="h-4 w-4 text-primary" /> {isWorker ? t.lead : t.dirLead}</p>
        <button onClick={() => setLang(lang === "ko" ? "en" : "ko")} className="flex shrink-0 items-center gap-1 rounded-full border border-slate-300 px-2.5 py-1 text-xs font-semibold text-ink">
          <Languages className="h-3.5 w-3.5" /> {lang === "ko" ? "EN" : "한국어"}
        </button>
      </div>

      {isWorker ? <WorkerView t={t} uid={user!.uid} /> : <Directory t={t} />}

      <p className="mt-4 flex items-start gap-1 px-1 text-[11px] leading-relaxed text-muted">
        <Check className="mt-0.5 h-3 w-3 shrink-0" />
        ⚠️ 외국인고용법(고용허가제 EPS)·출입국관리법 준수, <b>합법 경로만</b> 안내합니다. 무허가 알선은 제공하지 않으며 정보 사전 확인을 중심으로 합니다.
      </p>
    </AppShell>
  );
}

// ── 협력사/관리자용 후보 디렉터리 ──
function Directory({ t }: { t: typeof T["ko"] }) {
  const [candidates, setCandidates] = useState<GlobalWorkerProfile[]>([]);
  useEffect(() => { phase2db.listGlobalCandidates().then(setCandidates); }, []);

  return (
    <>
      <div className="mb-2 mt-4 flex items-center gap-1.5 px-1">
        <Search className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-bold text-ink">{t.dirTitle}</h2>
        <span className="text-xs text-muted">{candidates.length}명</span>
      </div>
      <div className="space-y-2">
        {candidates.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink">{c.nationality}</span>
                  <Badge tone="neutral">{c.visaType}</Badge>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <Languages className="h-3.5 w-3.5" />
                  {Object.entries(c.languages).map(([k, v]) => `${k.toUpperCase()} ${"★".repeat(v)}`).join("  ")}
                </div>
              </div>
              {c.verified ? <Badge tone="success"><ShieldCheck className="mr-0.5 h-3 w-3" />{t.verified}</Badge> : <Badge tone="warn"><ShieldAlert className="mr-0.5 h-3 w-3" />{t.unverified}</Badge>}
            </div>

            <div className="mt-2 text-[11px] text-muted">{t.desiredJobs}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {c.desiredJobs.map((j) => <span key={j} className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary">{j}</span>)}
            </div>
            <div className="mt-2 text-[11px] text-muted">{t.desiredRegions}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {c.desiredRegions.map((r) => <span key={r} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-muted">{r}</span>)}
            </div>

            <div className="mt-2 text-[11px] text-muted">{c.visaStatus}</div>
            <Button
              variant="outline"
              className="mt-3 w-full"
              disabled={!c.verified}
              onClick={() => alert("사전 컨택 요청이 전송되었습니다. (데모) 합법 고용허가 절차 안내가 함께 제공됩니다.")}
            >
              <Phone className="h-4 w-4" /> {t.contact}{!c.verified && " (검증 후 가능)"}
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}

// ── 글로벌 워커 본인용 프로필 화면 ──
function WorkerView({ t, uid }: { t: typeof T["ko"]; uid: string }) {
  const [profile, setProfile] = useState<GlobalWorkerProfile | null>(null);
  const [programs, setPrograms] = useState<RelocationProgram[]>([]);

  useEffect(() => {
    phase2db.getGlobalProfile(uid).then(setProfile);
    phase2db.listPrograms().then(setPrograms);
  }, [uid]);

  const matched = profile ? programs.filter((p) => p.targetJobs.some((j) => profile.desiredJobs.includes(j))) : [];

  return (
    <>
      {profile && (
        <>
          <Card className="mt-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-ink">{t.profile}</div>
              {profile.verified ? <Badge tone="success"><ShieldCheck className="mr-0.5 h-3 w-3" />{t.verified}</Badge> : <Badge tone="warn"><ShieldAlert className="mr-0.5 h-3 w-3" />{t.unverified}</Badge>}
            </div>
            <div className="mt-2 text-xs text-muted">{profile.nationality}</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted"><Languages className="h-3.5 w-3.5" /> {t.langs}:</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {Object.entries(profile.languages).map(([k, v]) => (
                <span key={k} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-muted">{k.toUpperCase()} · {"★".repeat(v)}</span>
              ))}
            </div>
          </Card>

          <h2 className="mb-2 mt-5 px-1 text-lg font-bold text-ink">{t.visa}</h2>
          <Card>
            <Badge tone="primary">{profile.visaType}</Badge>
            <p className="mt-2 text-sm text-ink">{t.checklist}</p>
            <p className="mt-1 text-xs text-muted">{profile.visaStatus}</p>
            <div className="mt-3 space-y-1.5">
              {OFFICIAL.map((o) => (
                <a key={o.url} href={o.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-primary">
                  {o.label} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </Card>
        </>
      )}

      <h2 className="mb-2 mt-5 px-1 text-lg font-bold text-ink">{t.matched}</h2>
      <div className="space-y-2">
        {matched.map((p) => (
          <Card key={p.id}>
            <div className="flex items-center justify-between">
              <Badge tone="primary">{p.regionName}</Badge>
              <span className="text-xs text-muted">{p.orgName}</span>
            </div>
            <div className="mt-1.5 text-sm font-bold text-ink">{p.title}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.targetJobs.map((j) => <span key={j} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-muted">{j}</span>)}
            </div>
            <Link href="/relocate"><Button className="mt-3 w-full" variant="outline"><MapPin className="h-4 w-4" /> {t.apply}</Button></Link>
          </Card>
        ))}
        {matched.length === 0 && <Card className="text-center text-sm text-muted">—</Card>}
      </div>
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { phase2db } from "@/lib/phase2";
import { recommend, type DemandJob, type CourseLite } from "@/lib/phase2/engines";
import { demoStore } from "@/lib/demo-data";
import { formatKRW } from "@/lib/utils";
import { formatDistance } from "@/lib/geo";
import type { LatLng } from "@/types";
import type { SkillProfile, RecommendCard } from "@/types/phase2";
import { Hammer, GraduationCap, TrendingUp, MapPin, Crosshair } from "lucide-react";

// 강남권 지역 수요(데모). 실서비스는 open requests/jobs + PostGIS 매칭.
const DEMAND: DemandJob[] = [
  { categoryId: "t-woodwork", title: "카페 원목 선반 시공", geo: { lat: 37.5012, lng: 127.0396 }, basePay: 180000, demand: "high" },
  { categoryId: "t-woodwork", title: "사무실 책상 보수", geo: { lat: 37.4955, lng: 127.0301 }, basePay: 90000, demand: "medium" },
  { categoryId: "c-hvac-repair", title: "편의점 에어컨 점검", geo: { lat: 37.4979, lng: 127.0276 }, basePay: 120000, demand: "high" },
  { categoryId: "t-clean", title: "상가 입주 청소", geo: { lat: 37.5044, lng: 127.0246 }, basePay: 150000, demand: "medium" },
  { categoryId: "t-cook", title: "행사 반찬 케이터링", geo: { lat: 37.4925, lng: 127.0290 }, basePay: 200000, demand: "low" },
];

export default function RecommendPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [courses, setCourses] = useState<CourseLite[]>([]);
  const [origin, setOrigin] = useState<LatLng>(demoStore.geo);
  const [located, setLocated] = useState(false);

  useEffect(() => {
    if (!user) return;
    phase2db.listSkills(user.uid).then(setSkills);
    phase2db.listCourses().then((cs) =>
      phase2db.listVenues().then((vs) => {
        setCourses(
          cs.map((c) => ({
            id: c.id, categoryId: c.categoryId, title: c.title,
            geo: c.venueId ? vs.find((v) => v.id === c.venueId)?.geo : undefined,
            demand: "high", expectedPay: 150000,
          }))
        );
      })
    );
  }, [user]);

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => { setOrigin({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocated(true); },
      () => setLocated(false)
    );
  };

  const cards = useMemo(
    () => recommend({ origin, skills, jobs: DEMAND, courses }),
    [origin, skills, courses]
  );
  const jobs = cards.filter((c) => c.type === "job");
  const learn = cards.filter((c) => c.type === "course");
  const earn = cards.filter((c) => c.type === "earning");

  return (
    <AppShell title="내 위치 추천">
      <button onClick={locate} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-ink">
        <Crosshair className="h-4 w-4 text-primary" />
        {located ? "현재 위치 적용됨" : "현재 위치로 추천받기"} <span className="text-xs text-muted">({located ? "GPS" : "강남역 기준"})</span>
      </button>

      <Section icon={Hammer} title="지금 할 일" sub="내 강점 × 근처 수요">
        {jobs.map((c, i) => <RecCard key={i} c={c} />)}
        {jobs.length === 0 && <Empty>잘하는 분야를 등록하면 근처 일감을 추천해드려요.</Empty>}
      </Section>

      <Section icon={GraduationCap} title="배우면 더 벌 수 있는 것" sub="내 희망분야 × 인근 캠프">
        {learn.map((c, i) => <RecCard key={i} c={c} />)}
        {learn.length === 0 && <Empty>배우고 싶은 분야를 등록해보세요.</Empty>}
      </Section>

      <Section icon={TrendingUp} title="벌 수 있는 것" sub="근처 평균 수익">
        {earn.map((c, i) => <RecCard key={i} c={c} />)}
        {earn.length === 0 && <Empty>—</Empty>}
      </Section>
    </AppShell>
  );
}

function Section({ icon: Icon, title, sub, children }: { icon: React.ComponentType<{ className?: string }>; title: string; sub: string; children: React.ReactNode }) {
  return (
    <>
      <div className="mb-2 mt-6 flex items-center gap-1.5 px-1">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        <span className="text-xs text-muted">{sub}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </>
  );
}

const DEMAND_TONE = { high: "danger", medium: "warn", low: "neutral" } as const;
const DEMAND_LABEL = { high: "수요 높음", medium: "수요 보통", low: "수요 낮음" } as const;

function RecCard({ c }: { c: RecommendCard }) {
  return (
    <Link href={c.href}>
      <Card className="transition hover:ring-2 hover:ring-primary/30">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-bold text-ink">{c.title}</div>
            <div className="mt-0.5 text-xs text-muted">{c.subtitle}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted">
              {c.distanceM != null && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {formatDistance(c.distanceM)}</span>}
              {c.expectedPay != null && <span className="font-semibold text-ink">{formatKRW(c.expectedPay)}</span>}
            </div>
          </div>
          <Badge tone={DEMAND_TONE[c.demandLevel]}>{DEMAND_LABEL[c.demandLevel]}</Badge>
        </div>
      </Card>
    </Link>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <Card className="text-center text-xs text-muted">{children}</Card>;
}

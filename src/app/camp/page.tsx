"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import { phase2db } from "@/lib/phase2";
import { catName } from "@/lib/phase2/catalog";
import { formatKRW } from "@/lib/utils";
import type { Course, Cohort } from "@/types/phase2";
import { GraduationCap, MapPin, Wifi, Users, ChevronRight } from "lucide-react";

const MODE_LABEL = { online: "온라인", offline: "오프라인", hybrid: "온·오프라인" };

export default function CampPage() {
  return (
    <Suspense fallback={<AppShell title="고수되기 캠프"><div className="mt-6 text-center text-sm text-muted">불러오는 중…</div></AppShell>}>
      <CampInner />
    </Suspense>
  );
}

function CampInner() {
  const params = useSearchParams();
  const catFilter = params.get("cat");
  const [courses, setCourses] = useState<Course[]>([]);
  const [cohorts, setCohorts] = useState<Record<string, Cohort | undefined>>({});

  useEffect(() => {
    phase2db.listCourses().then(async (cs) => {
      const filtered = catFilter ? cs.filter((c) => c.categoryId === catFilter) : cs;
      setCourses(filtered);
      const map: Record<string, Cohort | undefined> = {};
      for (const c of filtered) map[c.id] = (await phase2db.cohortsFor(c.id))[0];
      setCohorts(map);
    });
  }, [catFilter]);

  return (
    <AppShell title="고수되기 캠프">
      <Card className="mt-2 flex items-center gap-2 bg-primary-soft">
        <GraduationCap className="h-5 w-5 text-primary" />
        <p className="text-xs text-primary">배워서 수료하면 해당 분야 <b>고수로 바로 활동</b>할 수 있어요.</p>
      </Card>

      {catFilter && (
        <div className="mt-3 flex items-center gap-2 px-1 text-xs text-muted">
          <Badge tone="primary">{catName(catFilter)}</Badge> 관련 코스
          <Link href="/camp" className="ml-auto text-primary">전체 보기</Link>
        </div>
      )}

      <div className="mt-3 space-y-3">
        {courses.map((c) => {
          const ch = cohorts[c.id];
          const full = ch ? ch.enrolled >= ch.capacity : false;
          return (
            <Link key={c.id} href={`/camp/${c.id}`}>
              <Card className="transition hover:ring-2 hover:ring-primary/30">
                <div className="flex items-center justify-between">
                  <Badge tone="primary">{catName(c.categoryId)}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    {c.mode === "online" ? <Wifi className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                    {MODE_LABEL[c.mode]}
                  </span>
                </div>
                <div className="mt-2 text-sm font-bold text-ink">{c.title}</div>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{c.summary}</p>
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span className="text-sm font-bold text-ink">{c.price === 0 ? "무료" : formatKRW(c.price)}</span>
                  <span className="flex items-center gap-2 text-xs text-muted">
                    {ch && <span className="flex items-center gap-0.5"><Users className="h-3.5 w-3.5" /> {ch.enrolled}/{ch.capacity}</span>}
                    {full ? <Badge tone="danger">마감임박</Badge> : <Badge tone="success">모집중</Badge>}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
        {courses.length === 0 && <Card className="text-center text-sm text-muted">해당 분야 코스가 아직 없습니다.</Card>}
      </div>

      <p className="mt-4 px-1 text-[11px] leading-relaxed text-muted">
        ⚠️ 수료증은 민간 발급이며 국가자격이 아닙니다. 유료·체계적 교육은 학원·평생교육·자격기본법 등록을 전제로 운영합니다.
      </p>
    </AppShell>
  );
}

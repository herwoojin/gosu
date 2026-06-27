"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, LinkButton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { phase2db } from "@/lib/phase2";
import { catName } from "@/lib/phase2/catalog";
import { formatKRW } from "@/lib/utils";
import type { SkillProfile, FieldEarning, TrustScore, Enrollment } from "@/types/phase2";
import { Star, TrendingUp, GraduationCap, Sparkles, Target, ChevronRight, Award } from "lucide-react";

export default function MyHubPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [earnings, setEarnings] = useState<FieldEarning[]>([]);
  const [score, setScore] = useState<TrustScore | null>(null);
  const [enrolls, setEnrolls] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (!user) return;
    phase2db.listSkills(user.uid).then(setSkills);
    phase2db.fieldEarnings().then(setEarnings);
    phase2db.getTrustScore(user.uid).then(setScore);
    phase2db.listEnrollments(user.uid).then(setEnrolls);
  }, [user]);

  const strengths = skills.filter((s) => s.kind === "strength");
  const aspirations = skills.filter((s) => s.kind === "aspiration");
  const totalRevenue = earnings.reduce((a, e) => a + e.revenue, 0);

  return (
    <AppShell title="N잡러 프로필">
      {/* 요약 */}
      <Card className="mt-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-ink">{user?.displayName ?? "고수"}</div>
            <div className="mt-0.5 text-xs text-muted">활동 분야 {earnings.length} · 학습 {aspirations.length}</div>
          </div>
          {score && (
            <Link href="/trust" className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">
              <Award className="h-3.5 w-3.5" /> {score.grade} ★{score.composite}
            </Link>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-1 text-xs text-muted"><TrendingUp className="h-3.5 w-3.5" /> 누적 수익</div>
            <div className="mt-1 text-base font-bold text-ink">{formatKRW(totalRevenue)}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-1 text-xs text-muted"><GraduationCap className="h-3.5 w-3.5" /> 수강 중</div>
            <div className="mt-1 text-base font-bold text-ink">{enrolls.filter((e) => e.status !== "completed").length}개</div>
          </div>
        </div>
      </Card>

      <LinkButton href="/me/recommend" className="mt-3 w-full" size="lg">
        <Target className="h-5 w-5" /> 내 위치에서 할 수 있는 일 보기
      </LinkButton>

      {/* 잘하는 분야 */}
      <div className="mb-2 mt-6 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-1 text-lg font-bold text-ink"><Sparkles className="h-4 w-4 text-primary" /> 잘하는 분야</h2>
        <Link href="/me/skills" className="text-xs text-primary">편집</Link>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {strengths.map((s) => (
          <span key={s.id} className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            {catName(s.categoryId)}
            <span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < s.level ? "fill-current" : "opacity-25"}`} />)}</span>
          </span>
        ))}
        {strengths.length === 0 && <span className="text-xs text-muted">아직 등록한 분야가 없어요.</span>}
      </div>

      {/* 분야별 수익 */}
      <h2 className="mb-2 mt-6 px-1 text-lg font-bold text-ink">분야별 수익·평점</h2>
      <div className="space-y-2">
        {earnings.map((e) => (
          <Card key={e.categoryId} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-ink">{catName(e.categoryId)}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                <span className="flex items-center gap-0.5 text-warn"><Star className="h-3 w-3 fill-current" /> {e.rating.toFixed(1)}</span>
                <span>완료 {e.jobs}건</span>
              </div>
            </div>
            <div className="text-sm font-bold text-ink">{formatKRW(e.revenue)}</div>
          </Card>
        ))}
      </div>

      {/* 배우고 싶은 분야 → 캠프 추천 */}
      <div className="mb-2 mt-6 flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-ink">배우고 싶은 분야</h2>
        <Link href="/me/skills" className="text-xs text-primary">편집</Link>
      </div>
      <div className="space-y-2">
        {aspirations.map((s) => (
          <Link key={s.id} href={`/camp?cat=${s.categoryId}`}>
            <Card className="flex items-center justify-between transition hover:ring-2 hover:ring-primary/30">
              <div>
                <div className="text-sm font-bold text-ink">{catName(s.categoryId)}</div>
                <div className="text-xs text-muted">관련 캠프 추천 보기</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Card>
          </Link>
        ))}
        {aspirations.length === 0 && <p className="px-1 text-xs text-muted">배우고 싶은 분야를 등록하면 캠프를 추천해드려요.</p>}
      </div>
    </AppShell>
  );
}

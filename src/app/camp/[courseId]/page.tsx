"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { phase2db } from "@/lib/phase2";
import { catName } from "@/lib/phase2/catalog";
import { formatKRW } from "@/lib/utils";
import type { Course, Cohort, Enrollment, OfflineVenue } from "@/types/phase2";
import { Check, Users, Calendar, MapPin, Award, CheckCircle2 } from "lucide-react";

const MODE_LABEL = { online: "온라인", offline: "오프라인", hybrid: "온·오프라인" };

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [venue, setVenue] = useState<OfflineVenue | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

  const reload = async () => {
    if (!user) return;
    const c = await phase2db.getCourse(courseId);
    setCourse(c);
    const ch = (await phase2db.cohortsFor(courseId))[0] ?? null;
    setCohort(ch);
    if (c?.venueId) setVenue((await phase2db.listVenues()).find((v) => v.id === c.venueId) ?? null);
    const mine = (await phase2db.listEnrollments(user.uid)).find((e) => e.courseId === courseId) ?? null;
    setEnrollment(mine);
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [user, courseId]);

  const enroll = async () => {
    if (!user || !cohort || !course) return;
    await phase2db.enroll({ uid: user.uid, cohortId: cohort.id, courseId: course.id });
    reload();
  };
  const complete = async () => {
    if (!enrollment) return;
    await phase2db.completeEnrollment(enrollment.id);
    reload();
  };

  if (!course) return <AppShell title="코스"><Card className="mt-6 text-center text-sm text-muted">불러오는 중…</Card></AppShell>;

  const completed = enrollment?.status === "completed";

  return (
    <AppShell title="코스 상세">
      <Card className="mt-2">
        <div className="flex items-center justify-between">
          <Badge tone="primary">{catName(course.categoryId)}</Badge>
          <span className="text-xs text-muted">{MODE_LABEL[course.mode]} · {course.mentorName}</span>
        </div>
        <h1 className="mt-2 text-lg font-bold text-ink">{course.title}</h1>
        <p className="mt-1 text-sm text-muted">{course.summary}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
          {cohort && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {cohort.startDate} ~ {cohort.endDate}</span>}
          {cohort && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {cohort.enrolled}/{cohort.capacity}</span>}
          {venue && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {venue.name}</span>}
        </div>
      </Card>

      <h2 className="mb-2 mt-5 px-1 text-lg font-bold text-ink">커리큘럼</h2>
      <Card>
        <ol className="space-y-2">
          {course.lessons.map((l, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-ink">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">{i + 1}</span>
              {l}
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-4 flex items-center gap-1 rounded-xl bg-amber-50 p-3 text-[11px] text-amber-700">
        <Award className="h-4 w-4 shrink-0" /> 수료 시 {course.certType} 발급 — 국가자격이 아닌 민간 수료증입니다.
      </div>

      {/* 상태별 액션 */}
      {completed ? (
        <Card className="mt-3 text-center">
          <CheckCircle2 className="mx-auto h-9 w-9 text-success" />
          <h3 className="mt-2 text-base font-bold text-ink">수료 완료!</h3>
          <p className="mt-1 text-xs text-muted">이제 <b>{catName(course.categoryId)}</b> 분야 고수로 활동할 수 있어요.</p>
          <Link href="/me"><Button className="mt-3 w-full">내 프로필에서 확인</Button></Link>
        </Card>
      ) : enrollment ? (
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between px-1 text-xs text-muted">
            <span>진행률</span><span className="font-bold text-ink">{enrollment.progress}%</span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-primary" style={{ width: `${enrollment.progress}%` }} />
          </div>
          <Button className="w-full" size="lg" onClick={complete}><Check className="h-5 w-5" /> 수료 처리(데모)</Button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3">
          <div className="text-lg font-bold text-ink">{course.price === 0 ? "무료" : formatKRW(course.price)}</div>
          <Button className="flex-1" size="lg" onClick={enroll}>수강 신청 {course.price > 0 && "· 결제"}</Button>
        </div>
      )}
      {!enrollment && course.price > 0 && (
        <p className="mt-2 px-1 text-[11px] text-muted">결제는 Phase 1 결제구조(라이선스 PG)를 재사용합니다. (데모)</p>
      )}
    </AppShell>
  );
}

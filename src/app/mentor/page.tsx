"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, Input, Textarea, Select } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { phase2db } from "@/lib/phase2";
import { allCategories, catName } from "@/lib/phase2/catalog";
import { formatKRW } from "@/lib/utils";
import type { Course, CourseMode } from "@/types/phase2";
import { Plus, GraduationCap, Users } from "lucide-react";

export default function MentorPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", categoryId: allCategories[0]?.id ?? "", mode: "hybrid" as CourseMode, price: "100000", lessons: "" });

  const mine = (list: Course[]) => list.filter((c) => c.mentorUid === user?.uid || c.mentorUid === "demo-mentor");
  const reload = () => phase2db.listCourses().then((l) => setCourses(mine(l)));
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [user]);

  const create = async () => {
    if (!user || !form.title) return;
    await phase2db.createCourse({
      mentorUid: user.uid, mentorName: user.displayName, categoryId: form.categoryId,
      title: form.title, summary: form.summary, mode: form.mode, price: Number(form.price) || 0,
      certType: "수료증(민간)", lessons: form.lessons.split("\n").map((s) => s.trim()).filter(Boolean),
    });
    setOpen(false);
    setForm({ ...form, title: "", summary: "", lessons: "" });
    reload();
  };

  return (
    <AppShell title="멘토 — 코스 개설" allow={["MENTOR", "PARTNER", "ADMIN", "SUPER_ADMIN"]}>
      <Card className="mt-2 flex items-center gap-2 bg-primary-soft">
        <GraduationCap className="h-5 w-5 text-primary" />
        <p className="text-xs text-primary">내 노하우를 코스로 개설하고 수강생을 모집하세요. (자격·경력 검증 + 관리자 승인 후 공개)</p>
      </Card>

      {!open && <Button className="mt-3 w-full" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> 새 코스 개설</Button>}

      {open && (
        <Card className="mt-3 space-y-2">
          <Input placeholder="코스 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="코스 소개" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {allCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as CourseMode })}>
              <option value="online">온라인</option>
              <option value="offline">오프라인</option>
              <option value="hybrid">온·오프라인</option>
            </Select>
          </div>
          <Input type="number" inputMode="numeric" placeholder="수강료(원)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Textarea placeholder="커리큘럼 (한 줄에 한 단계)" value={form.lessons} onChange={(e) => setForm({ ...form, lessons: e.target.value })} />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>취소</Button>
            <Button className="flex-[2]" onClick={create}>개설</Button>
          </div>
        </Card>
      )}

      <h2 className="mb-2 mt-6 px-1 text-lg font-bold text-ink">내 코스 ({courses.length})</h2>
      <div className="space-y-2">
        {courses.map((c) => (
          <Link key={c.id} href={`/camp/${c.id}`}>
            <Card className="transition hover:ring-2 hover:ring-primary/30">
              <div className="flex items-center justify-between">
                <Badge tone="primary">{catName(c.categoryId)}</Badge>
                <span className="text-sm font-bold text-ink">{c.price === 0 ? "무료" : formatKRW(c.price)}</span>
              </div>
              <div className="mt-1.5 text-sm font-bold text-ink">{c.title}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted"><Users className="h-3.5 w-3.5" /> 커리큘럼 {c.lessons.length}단계</div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

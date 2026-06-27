"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Button, Select } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { phase2db } from "@/lib/phase2";
import { allCategories, catName } from "@/lib/phase2/catalog";
import type { SkillProfile, SkillKind } from "@/types/phase2";
import { Star, Trash2, Plus, Sparkles, BookOpen } from "lucide-react";

export default function SkillsEditorPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [kind, setKind] = useState<SkillKind>("strength");
  const [categoryId, setCategoryId] = useState(allCategories[0]?.id ?? "");
  const [level, setLevel] = useState(3);

  const reload = () => user && phase2db.listSkills(user.uid).then(setSkills);
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [user]);

  const add = async () => {
    if (!user || !categoryId) return;
    await phase2db.addSkill({ uid: user.uid, categoryId, kind, level: kind === "strength" ? level : 0 });
    reload();
  };
  const remove = async (id: string) => { await phase2db.removeSkill(id); reload(); };

  const strengths = skills.filter((s) => s.kind === "strength");
  const aspirations = skills.filter((s) => s.kind === "aspiration");

  return (
    <AppShell title="스킬 · 희망분야 등록">
      <Card className="mt-2">
        <div className="mb-2 grid grid-cols-2 gap-2">
          {(["strength", "aspiration"] as SkillKind[]).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-xl border p-2.5 text-left ${kind === k ? "border-primary bg-primary-soft" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-center gap-1 text-sm font-bold text-ink">
                {k === "strength" ? <Sparkles className="h-4 w-4 text-primary" /> : <BookOpen className="h-4 w-4 text-primary" />}
                {k === "strength" ? "잘하는 분야" : "배우고 싶은 분야"}
              </div>
              <div className="text-[11px] text-muted">{k === "strength" ? "고수로 활동" : "캠프 추천"}</div>
            </button>
          ))}
        </div>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {allCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        {kind === "strength" && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted">숙련도</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} onClick={() => setLevel(i + 1)}>
                <Star className={`h-6 w-6 ${i < level ? "fill-warn text-warn" : "text-slate-300"}`} />
              </button>
            ))}
          </div>
        )}
        <Button className="mt-3 w-full" onClick={add}><Plus className="h-4 w-4" /> 추가</Button>
      </Card>

      <h2 className="mb-2 mt-6 px-1 text-lg font-bold text-ink">잘하는 분야 ({strengths.length})</h2>
      <div className="space-y-2">
        {strengths.map((s) => (
          <Card key={s.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-ink">{catName(s.categoryId)}</div>
              <div className="mt-0.5 flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < s.level ? "fill-warn text-warn" : "text-slate-300"}`} />)}</div>
            </div>
            <button onClick={() => remove(s.id)} className="text-muted"><Trash2 className="h-4 w-4" /></button>
          </Card>
        ))}
        {strengths.length === 0 && <p className="px-1 text-xs text-muted">없음</p>}
      </div>

      <h2 className="mb-2 mt-6 px-1 text-lg font-bold text-ink">배우고 싶은 분야 ({aspirations.length})</h2>
      <div className="space-y-2">
        {aspirations.map((s) => (
          <Card key={s.id} className="flex items-center justify-between">
            <div className="text-sm font-bold text-ink">{catName(s.categoryId)}</div>
            <button onClick={() => remove(s.id)} className="text-muted"><Trash2 className="h-4 w-4" /></button>
          </Card>
        ))}
        {aspirations.length === 0 && <p className="px-1 text-xs text-muted">없음</p>}
      </div>
    </AppShell>
  );
}

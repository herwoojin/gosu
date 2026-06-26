"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Input, Textarea, Select } from "@/components/ui";
import { categories, getTemplate } from "@/lib/demo-data";
import type { TemplateField } from "@/types";
import { ChevronLeft, ChevronRight, Check, ImagePlus } from "lucide-react";

function Wizard() {
  const params = useSearchParams();
  const router = useRouter();
  const initialCat = params.get("category") ?? categories[0].id;

  const [categoryId, setCategoryId] = useState(initialCat);
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const template = useMemo(() => getTemplate(categoryId), [categoryId]);
  const steps = template.steps;
  const step = steps[stepIdx];
  const progress = Math.round(((stepIdx + 1) / steps.length) * 100);

  const setVal = (k: string, v: string) => setAnswers((a) => ({ ...a, [k]: v }));

  const canNext = step.fields.every((f) => !f.required || (answers[f.key] && answers[f.key].trim() !== ""));

  const next = () => {
    if (stepIdx < steps.length - 1) setStepIdx((i) => i + 1);
    else setDone(true);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-green-50 text-success">
          <Check className="h-8 w-8" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-ink">견적요청이 등록되었어요</h2>
        <p className="mt-2 text-sm text-muted">
          근처 검증된 협력사에게 매칭 알림이 발송됩니다. 입찰이 도착하면 알려드릴게요.
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={() => router.push("/owner/requests")}>
          입찰현황 보러가기
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* 진행바 */}
      <div className="mt-2">
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>{step.title}</span>
          <span>{stepIdx + 1} / {steps.length}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {stepIdx === 0 && (
        <Card className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-ink">공종 선택</label>
          <Select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setStepIdx(0); setAnswers({}); }}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Card>
      )}

      <div className="mt-4 space-y-4">
        {step.fields.map((f) => (
          <Field key={f.key} field={f} value={answers[f.key] ?? ""} onChange={(v) => setVal(f.key, v)} />
        ))}
      </div>

      {/* 하단 고정 네비 */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t border-slate-100 bg-white p-3 md:max-w-[1024px]">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => (stepIdx === 0 ? router.back() : setStepIdx((i) => i - 1))}
          >
            <ChevronLeft className="h-5 w-5" /> 이전
          </Button>
          <Button size="lg" className="flex-[2]" disabled={!canNext} onClick={next}>
            {stepIdx === steps.length - 1 ? "요청 등록" : "다음"} <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ field, value, onChange }: { field: TemplateField; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">
        {field.label} {field.required && <span className="text-danger">*</span>}
      </label>
      {field.type === "textarea" && (
        <Textarea placeholder={field.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {field.type === "select" && (
        <Select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">선택하세요</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      )}
      {(field.type === "text" || field.type === "number") && (
        <Input
          type={field.type}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.type === "media" && (
        <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 text-muted">
          <ImagePlus className="h-7 w-7" />
          <span className="text-xs">사진/동영상 첨부 (선택)</span>
          <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => onChange(e.target.files?.length ? `${e.target.files.length}개 첨부됨` : "")} />
          {value && <span className="text-xs text-primary">{value}</span>}
        </label>
      )}
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <AppShell title="견적요청" allow={["OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <Suspense fallback={<div className="py-10 text-center text-muted">불러오는 중…</div>}>
        <Wizard />
      </Suspense>
    </AppShell>
  );
}

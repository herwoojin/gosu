"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleHome } from "@/lib/auth";
import { Button, Card } from "@/components/ui";
import type { Role } from "@/types";
import { LogIn, ShieldCheck, Store, Wrench, Building2, GraduationCap, Landmark, Globe } from "lucide-react";

const DEMO_ROLES: { role: Role; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { role: "OWNER", label: "경영주 (점주)", desc: "견적요청 · 입찰비교 · 결제", icon: Store },
  { role: "PARTNER", label: "협력사 (고수)", desc: "일감 · 입찰 · N잡러 · 캠프", icon: Wrench },
  { role: "MENTOR", label: "멘토 (강사)", desc: "고수되기 캠프 코스 개설", icon: GraduationCap },
  { role: "LGU", label: "지자체 담당자", desc: "이주 프로그램 · 바우처", icon: Landmark },
  { role: "WORKER_GLOBAL", label: "글로벌 워커", desc: "입국 전 합법 사전 매칭", icon: Globe },
  { role: "ADMIN", label: "본부 관리자", desc: "협력사 승인 · 단가 · 결제승인", icon: Building2 },
  { role: "SUPER_ADMIN", label: "슈퍼관리자", desc: "관리자 지정 · 마스터 설정", icon: ShieldCheck },
];

export default function LoginPage() {
  const { user, loading, demo, signInGoogle, signInDemo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace(roleHome(user.activeRole));
  }, [user, loading, router]);

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div className="text-3xl font-bold text-primary">우리동네고수</div>
        <p className="mt-2 text-sm text-muted">
          편의점 본부 시설지원 · 입찰형 협력사 매칭
        </p>
      </div>

      <Button size="lg" variant="outline" className="mb-3" onClick={() => signInGoogle()}>
        <LogIn className="h-5 w-5" /> Google로 시작하기
      </Button>

      <Card className="mt-4 border border-slate-200">
        <div className="mb-1 flex items-center gap-2 text-sm font-bold text-ink">
          역할로 바로 입장
          {demo && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-warn">데모</span>}
        </div>
        <p className="mb-3 text-xs text-muted">
          체험할 역할을 선택하세요. 입장 후 <b>내정보 → 역할 전환</b>에서 언제든 다른 역할로 바꿀 수 있습니다.
        </p>
        <div className="grid grid-cols-1 gap-2">
          {DEMO_ROLES.map(({ role, label, desc, icon: Icon }) => (
            <button
              key={role}
              onClick={() => signInDemo(role)}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-primary"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{label}</span>
                <span className="block text-xs text-muted">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      <p className="mt-8 px-2 text-center text-[11px] leading-relaxed text-muted">
        우리동네고수는 통신판매중개자로서 거래 당사자가 아니며, 요청자와 협력사 간 거래의 책임은
        거래 당사자에게 있습니다.
      </p>
    </div>
  );
}

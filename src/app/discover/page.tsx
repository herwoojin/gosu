"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import {
  User, MapPinned, GraduationCap, Award, BadgeDollarSign, Store, Megaphone,
  Building2, Bus, Globe, ChevronRight,
} from "lucide-react";

type Mod = { href: string; title: string; desc: string; icon: React.ComponentType<{ className?: string }>; tag: string };

const PHASE_A: Mod[] = [
  { href: "/me", title: "N잡러 프로필", desc: "잘하는 분야 + 배우고 싶은 분야 한 곳에서", icon: User, tag: "M1" },
  { href: "/me/recommend", title: "내 위치 추천", desc: "지금 할 일 · 배울 것 · 벌 수 있는 것", icon: MapPinned, tag: "M9" },
  { href: "/trust", title: "신뢰·친절·다시만나요 점수", desc: "3종 점수 + 등급(새싹/일반/우수/마스터)", icon: Award, tag: "M3" },
  { href: "/pricing-guide", title: "단가 차등 가이드", desc: "고득점 고수에게 더 높은 단가를 주는 이유", icon: BadgeDollarSign, tag: "M3" },
  { href: "/camp", title: "고수되기 캠프", desc: "코스·기수·수료 — 온라인+오프라인", icon: GraduationCap, tag: "M2" },
];
const PHASE_B: Mod[] = [
  { href: "/shop", title: "1인 커머스", desc: "내 브랜드 상점 — 재능·물품·음식 판매", icon: Store, tag: "M5" },
  { href: "/marketing", title: "마케팅 자동화", desc: "영상 1개 → 인스타·유튜브 동시 게시", icon: Megaphone, tag: "M6" },
  { href: "/venues", title: "오프라인 거점", desc: "남는 공간을 교육·커뮤니티·판매 거점으로", icon: Building2, tag: "M7" },
];
const PHASE_C: Mod[] = [
  { href: "/relocate", title: "지방 이주·정착", desc: "주거·KTX·항공 보조 + 온누리상품권", icon: Bus, tag: "M4" },
  { href: "/global", title: "글로벌 워커 매칭", desc: "입국 전 합법 사전 매칭 · 비자 안내", icon: Globe, tag: "M8" },
];

function ModList({ title, mods }: { title: string; mods: Mod[] }) {
  return (
    <>
      <h2 className="mb-2 mt-6 px-1 text-sm font-bold text-muted">{title}</h2>
      <div className="space-y-2">
        {mods.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.href} href={m.href}>
              <Card className="flex items-center gap-3 transition hover:ring-2 hover:ring-primary/30">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">{m.title}</span>
                    <Badge tone="neutral">{m.tag}</Badge>
                  </div>
                  <div className="truncate text-xs text-muted">{m.desc}</div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default function DiscoverPage() {
  return (
    <AppShell title="고수+ 디스커버리">
      <Card className="mt-2 bg-gradient-to-br from-primary to-blue-700 text-white">
        <div className="text-base font-bold">누구나 고수가 되고, 어디서나 일하는</div>
        <div className="mt-0.5 text-sm opacity-90">잘하는 일은 돕고, 잘하고 싶은 일은 배우고, 전국 어디서나 N잡러로.</div>
      </Card>

      <ModList title="재능 · 교육 · 점수 (Phase 2-A)" mods={PHASE_A} />
      <ModList title="커머스 · 마케팅 · 거점 (Phase 2-B)" mods={PHASE_B} />
      <ModList title="이주 · 정착 · 글로벌 (Phase 2-C)" mods={PHASE_C} />

      <p className="mt-6 px-1 text-[11px] leading-relaxed text-muted">
        ⚠️ 교육·수료(민간자격), 바우처·보조금, 식품 판매, SNS 자동화, 외국인 고용은 관련 법령 준수 및
        전문가 검토를 전제로 한 데모 화면입니다.
      </p>
    </AppShell>
  );
}

"use client";

import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";

// 모든 역할 홈에 노출하는 Phase 2(고수+ 디스커버리) 진입 배너
export function DiscoverBanner() {
  return (
    <Link href="/discover">
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-violet-500 to-primary p-4 text-white shadow-card transition active:scale-[0.99]">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20">
          <Sparkles className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">고수+ 디스커버리</div>
          <div className="truncate text-xs opacity-90">N잡러 · 캠프 · 신뢰점수 · 1인커머스 · 이주 · 글로벌 인재</div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 opacity-90" />
      </div>
    </Link>
  );
}

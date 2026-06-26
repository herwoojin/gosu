"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle, Badge, LinkButton } from "@/components/ui";
import { categories, demoRequests, categoryById } from "@/lib/demo-data";
import { timeAgo } from "@/lib/utils";
import * as Icons from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  open: "입찰대기", bidding: "입찰중", awarded: "낙찰", in_progress: "작업중",
  completed: "완료", canceled: "취소", expired: "만료", draft: "임시저장",
};

export default function OwnerHome() {
  return (
    <AppShell title="경영주" allow={["OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <div className="mt-2 rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-5 text-white">
        <p className="text-sm opacity-90">고장·누수·철거, 무엇이든</p>
        <p className="mt-1 text-xl font-bold">근처 검증된 고수에게 입찰받으세요</p>
        <LinkButton href="/owner/new" variant="outline" className="mt-4 bg-white text-primary" size="lg">
          <Icons.Plus className="h-5 w-5" /> 견적요청 시작
        </LinkButton>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link href="/owner/nearby">
          <Card className="h-full">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icons.MapPin className="h-6 w-6" />
            </span>
            <div className="mt-3 text-sm font-bold text-ink">근처 고수 지도</div>
            <div className="mt-0.5 text-xs text-muted">가까운 전문가 호출·컨설팅</div>
          </Card>
        </Link>
        <Link href="/owner/consults">
          <Card className="h-full">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icons.HeartHandshake className="h-6 w-6" />
            </span>
            <div className="mt-3 text-sm font-bold text-ink">내 컨설팅</div>
            <div className="mt-0.5 text-xs text-muted">요청·진행 상태 보기</div>
          </Card>
        </Link>
      </div>

      <SectionTitle>어떤 작업이 필요하세요?</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((c) => {
          const Icon = (Icons as any)[c.icon] ?? Icons.Wrench;
          return (
            <Link key={c.id} href={`/owner/new?category=${c.id}`}>
              <Card className="h-full">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="mt-3 text-sm font-bold text-ink">{c.name}</div>
                <div className="mt-0.5 text-xs text-muted">{c.description}</div>
              </Card>
            </Link>
          );
        })}
      </div>

      <SectionTitle action={<Link href="/owner/requests" className="text-sm text-primary">전체보기</Link>}>
        진행 중인 요청
      </SectionTitle>
      <div className="space-y-3">
        {demoRequests.map((r) => (
          <Link key={r.id} href={`/owner/requests/${r.id}`}>
            <Card>
              <div className="flex items-center justify-between">
                <Badge tone="primary">{categoryById(r.categoryId)?.name}</Badge>
                <Badge tone={r.status === "bidding" ? "warn" : "neutral"}>{STATUS_LABEL[r.status]}</Badge>
              </div>
              <div className="mt-2 text-sm font-bold text-ink">{r.title}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                <Icons.MapPin className="h-3.5 w-3.5" /> {r.address}
                <span>· {timeAgo(r.createdAt)}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

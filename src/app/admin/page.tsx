"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui";
import { DiscoverBanner } from "@/components/DiscoverBanner";
import { useAuth } from "@/lib/auth";
import { demoPartners, demoRequests } from "@/lib/demo-data";
import { CheckSquare, Building2, BarChart3, AlertTriangle, ShieldCheck, Users, FileSignature } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const pending = demoPartners.filter((p) => p.status === "pending").length;
  const isSuper = user?.roles.includes("SUPER_ADMIN");

  const stats = [
    { label: "승인 대기 협력사", value: pending, tone: "text-warn" },
    { label: "진행 중 요청", value: demoRequests.length, tone: "text-primary" },
    { label: "본부결제 승인 대기", value: 1, tone: "text-danger" },
  ];

  const menu = [
    { href: "/admin/partners", label: "협력사 승인", desc: `${pending}건 대기`, icon: CheckSquare },
    { href: "/admin/payments", label: "본부결제 큐", desc: "승인·기록", icon: Building2 },
    { href: "/admin/pricing", label: "단가 분석", desc: "전국/지방/현재", icon: BarChart3 },
    { href: "/admin/disputes", label: "분쟁 처리", desc: "클레임 관리", icon: AlertTriangle },
    { href: "/contracts", label: "계약 검토·서명", desc: "특약·전자서명", icon: FileSignature },
  ];

  return (
    <AppShell title="본부 관리자" allow={["ADMIN", "SUPER_ADMIN"]}>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="text-center">
            <div className={`text-2xl font-bold ${s.tone}`}>{s.value}</div>
            <div className="mt-1 text-[11px] leading-tight text-muted">{s.label}</div>
          </Card>
        ))}
      </div>

      <DiscoverBanner />

      <h2 className="mb-3 mt-6 px-1 text-lg font-bold text-ink">업무</h2>
      <div className="grid grid-cols-2 gap-3">
        {menu.map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="h-full">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <div className="mt-3 text-sm font-bold text-ink">{label}</div>
              <div className="text-xs text-muted">{desc}</div>
            </Card>
          </Link>
        ))}
      </div>

      {isSuper && (
        <>
          <div className="mb-3 mt-6 flex items-center gap-2 px-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-ink">슈퍼관리자</h2>
          </div>
          <Link href="/admin/managers">
            <Card>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-sm font-bold text-ink">관리자 지정 / 회수</div>
                  <div className="text-xs text-muted">OWNER → ADMIN 승격 (자가승격 금지 · 감사로그)</div>
                </div>
              </div>
            </Card>
          </Link>
        </>
      )}
    </AppShell>
  );
}

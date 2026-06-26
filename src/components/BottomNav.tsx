"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Home, FileText, Gavel, User, LayoutDashboard, CheckSquare, BarChart3, Briefcase, MapPin, HeartHandshake, Map } from "lucide-react";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV: Record<string, Item[]> = {
  OWNER: [
    { href: "/owner", label: "홈", icon: Home },
    { href: "/owner/nearby", label: "근처 고수", icon: MapPin },
    { href: "/owner/market", label: "상권지도", icon: Map },
    { href: "/owner/new", label: "견적요청", icon: Gavel },
    { href: "/owner/requests", label: "내 요청", icon: FileText },
    { href: "/profile", label: "내정보", icon: User },
  ],
  PARTNER: [
    { href: "/partner", label: "일감", icon: Briefcase },
    { href: "/partner/bids", label: "내 입찰", icon: Gavel },
    { href: "/partner/consulting", label: "컨설팅", icon: HeartHandshake },
    { href: "/partner/profile", label: "프로필", icon: User },
  ],
  ADMIN: [
    { href: "/admin", label: "대시보드", icon: LayoutDashboard },
    { href: "/admin/partners", label: "협력사 승인", icon: CheckSquare },
    { href: "/admin/pricing", label: "단가", icon: BarChart3 },
    { href: "/profile", label: "내정보", icon: User },
  ],
};

export function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  if (!user) return null;
  const role = user.activeRole === "SUPER_ADMIN" ? "ADMIN" : user.activeRole;
  const items = NAV[role] ?? NAV.OWNER;

  return (
    <nav
      className="sticky bottom-0 z-30 grid border-t border-slate-100 bg-white/95 backdrop-blur"
      style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)`, paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((it) => {
        const active = pathname === it.href || (it.href !== "/owner" && it.href !== "/partner" && it.href !== "/admin" && pathname.startsWith(it.href));
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn("flex h-16 flex-col items-center justify-center gap-1 text-xs", active ? "text-primary" : "text-muted")}
          >
            <Icon className="h-5 w-5" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

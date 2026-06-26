"use client";

import { AppShell } from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import { demoNotifications } from "@/lib/demo-data";
import { timeAgo } from "@/lib/utils";
import { Bell, Gavel, Trophy, Wallet, Star } from "lucide-react";

const ICON = { match: Bell, bid: Gavel, award: Trophy, settle: Wallet, rating: Star };

export default function Notifications() {
  return (
    <AppShell title="알림">
      <div className="mt-3 space-y-2">
        {demoNotifications.map((n) => {
          const Icon = ICON[n.type] ?? Bell;
          return (
            <Card key={n.id} className={n.read ? "opacity-70" : ""}>
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink">{n.title}</span>
                    {!n.read && <Badge tone="primary">새 알림</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                  <div className="mt-1 text-[11px] text-muted">{timeAgo(n.createdAt)}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <p className="mt-4 px-1 text-[11px] text-muted">
        광고성 알림은 수신동의 후 야간(21~08시)에는 발송되지 않습니다.
      </p>
    </AppShell>
  );
}

"use client";

import { AppShell } from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";

export default function AdminDisputes() {
  return (
    <AppShell title="분쟁 처리" allow={["ADMIN", "SUPER_ADMIN"]}>
      <Card className="mt-3 text-center">
        <Badge tone="success">접수된 분쟁 없음</Badge>
        <p className="mt-3 text-sm text-muted">
          후기 이의신청·클레임이 접수되면 이곳에서 처리합니다. (Phase 3 고도화)
        </p>
      </Card>
    </AppShell>
  );
}

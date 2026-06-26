"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleHome } from "@/lib/auth";

// 스플래시/게이트웨이: 로그인 상태에 따라 역할 홈 또는 로그인으로 분기.
export default function Gateway() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? roleHome(user.activeRole) : "/login");
  }, [user, loading, router]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3">
      <div className="text-2xl font-bold text-primary">우리동네고수</div>
      <div className="text-sm text-muted">불러오는 중…</div>
    </div>
  );
}

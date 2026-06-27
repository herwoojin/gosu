"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleHome } from "@/lib/auth";
import { LoadingScreen } from "@/components/LoadingScreen";

// 스플래시/게이트웨이: 로그인 상태에 따라 역할 홈 또는 로그인으로 분기.
export default function Gateway() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? roleHome(user.activeRole) : "/login");
  }, [user, loading, router]);

  return <LoadingScreen />;
}

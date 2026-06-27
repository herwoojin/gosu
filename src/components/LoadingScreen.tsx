"use client";

import { useEffect } from "react";

// 첫 페인트에 보인 #boot-splash 를 React 마운트 후 부드럽게 제거.
export function BootSplashCleanup() {
  useEffect(() => {
    const el = document.getElementById("boot-splash");
    if (!el) return;
    // 최소 표시시간 보장(깜빡임 방지) 후 페이드아웃
    const t = setTimeout(() => {
      el.classList.add("hide");
      setTimeout(() => el.remove(), 550);
    }, 550);
    return () => clearTimeout(t);
  }, []);
  return null;
}

// 인앱 로딩 화면(인증 확인·라우트 게이트 등) — 부팅 스플래시와 동일한 비주얼.
export function LoadingScreen({ sub = "동네 고수와 연결 중…" }: { sub?: string }) {
  return (
    <div className="splash-screen">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="splash-img" src="/splash.jpg" alt="우리동네고수" />
      <div className="splash-title">우리동네고수</div>
      <div className="splash-sub">{sub}</div>
      <div className="splash-bar"><i /></div>
    </div>
  );
}

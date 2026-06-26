"use client";

import { useEffect } from "react";

// 서비스 워커 등록 (프로덕션 권장 — dev에선 조용히 시도만)
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}

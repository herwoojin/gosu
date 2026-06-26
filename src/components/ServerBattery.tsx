"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Level = "ok" | "warn" | "danger" | "critical" | "offline";

interface Health {
  ok: boolean;
  uptimeSec: number;
  memory: { usedMB: number; totalMB: number; percent: number } | null;
  cpuLoad1m: number | null;
  disk: { usedMB: number; totalMB: number; percent: number } | null;
  level: Level;
  reason: string;
}

const COLOR: Record<Level, string> = {
  ok: "#43a047",
  warn: "#fbc02d",
  danger: "#f57c00",
  critical: "#e53935",
  offline: "#9e9e9e",
};

const ANIM: Record<Level, string> = {
  ok: "",
  warn: "animate-battery-warn",
  danger: "animate-battery-danger",
  critical: "animate-battery-critical",
  offline: "",
};

// 글로벌 규칙: 우측 하단 고정 배터리. 채움률 = 100 - max(mem, disk).
export function ServerBattery() {
  const [health, setHealth] = useState<Health | null>(null);
  const [open, setOpen] = useState(false);
  const failCount = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const poll = async () => {
      if (document.hidden) return; // 백그라운드 탭이면 일시정지
      try {
        const res = await fetch("/api/server-health", { cache: "no-store" });
        if (!res.ok) throw new Error("bad");
        const data = (await res.json()) as Health;
        failCount.current = 0;
        setHealth(data);
      } catch {
        failCount.current += 1;
        if (failCount.current >= 3) {
          setHealth((h) => ({ ...(h ?? ({} as Health)), level: "offline", reason: "연결 실패" } as Health));
        }
      }
    };
    poll();
    timer = setInterval(poll, 30000);
    return () => clearInterval(timer);
  }, []);

  const level: Level = health?.level ?? "ok";
  const free = health?.memory && health?.disk
    ? 100 - Math.max(health.memory.percent, health.disk?.percent ?? 0)
    : health?.memory
      ? 100 - health.memory.percent
      : 100;
  const fill = Math.max(4, Math.min(100, free));
  const color = COLOR[level];

  return (
    <div className="fixed bottom-3 right-3 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {open && health && (
        <div className="mb-2 w-56 rounded-xl bg-white p-3 text-xs shadow-card">
          <div className="mb-1 font-bold text-ink">서버 용량 상태</div>
          <Row label="레벨" value={level === "offline" ? "오프라인" : level.toUpperCase()} />
          {health.memory && <Row label="메모리" value={`${health.memory.percent.toFixed(0)}%`} />}
          {health.disk && <Row label="디스크" value={`${health.disk.percent.toFixed(0)}%`} />}
          {health.cpuLoad1m != null && <Row label="CPU(1m)" value={health.cpuLoad1m.toFixed(2)} />}
          {health.uptimeSec != null && <Row label="업타임" value={`${Math.floor(health.uptimeSec / 60)}분`} />}
          {health.reason && <div className="mt-1 text-muted">{health.reason}</div>}
        </div>
      )}
      <button
        aria-label="서버 용량 표시기"
        onClick={() => setOpen((o) => !o)}
        className={cn("flex items-center", ANIM[level])}
      >
        <span className="flex h-7 w-12 items-center rounded-[5px] border-2 bg-white p-[2px]" style={{ borderColor: color }}>
          <span className="h-full rounded-[2px] transition-all" style={{ width: `${fill}%`, background: color }} />
        </span>
        <span className="h-3 w-[3px] rounded-r-sm" style={{ background: color }} />
        {level === "offline" && <span className="ml-1 text-[10px] font-bold text-[#9e9e9e]">!</span>}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

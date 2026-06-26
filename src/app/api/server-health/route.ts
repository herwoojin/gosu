import { NextResponse } from "next/server";
import os from "node:os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 글로벌 규칙: 백엔드 용량 신호등. try/catch 필수, <100ms 목표, 절대 다운 금지.
function levelFrom(percent: number): "ok" | "warn" | "danger" | "critical" {
  if (percent >= 95) return "critical";
  if (percent >= 85) return "danger";
  if (percent >= 70) return "warn";
  return "ok";
}

export async function GET() {
  try {
    // 프로세스 메모리 예산 기준(무료 호스팅 한도와 동일한 의미). 환경변수로 조정 가능.
    // os.freemem()은 macOS에서 캐시를 used로 잡아 과대평가되므로 RSS 기준이 더 정확.
    // 기본 2048MB. 무료 호스팅(예: 512MB) 배포 시 MEM_BUDGET_MB로 낮춰 실제 한도 반영.
    const budgetMB = Number(process.env.MEM_BUDGET_MB ?? 2048);
    const usedMB = Math.round(process.memoryUsage().rss / 1048576);
    const memPercent = Math.min(100, (usedMB / budgetMB) * 100);
    const cpuLoad1m = os.loadavg()[0] ?? 0;
    const cpuCount = os.cpus().length || 1;
    const cpuPercent = Math.min(100, (cpuLoad1m / cpuCount) * 100);

    const worst = Math.max(memPercent, cpuPercent);
    const level = levelFrom(worst);

    return NextResponse.json({
      ok: true,
      uptimeSec: Math.floor(process.uptime()),
      memory: {
        usedMB,
        totalMB: budgetMB,
        percent: Number(memPercent.toFixed(1)),
      },
      cpuLoad1m: Number(cpuLoad1m.toFixed(2)),
      // 디스크는 Node 내장으로 신뢰성 있게 못 얻으므로 null (다른 메트릭으로 산출)
      disk: null,
      level,
      reason: level === "ok" ? "" : `최대 사용률 ${worst.toFixed(0)}%`,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      uptimeSec: 0,
      memory: null,
      cpuLoad1m: null,
      disk: null,
      level: "critical",
      reason: "헬스 산출 실패",
    });
  }
}

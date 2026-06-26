// 웹훅/외부 API 연결 목업 계층.
// 도메인 이벤트가 발생하면 emitWebhook으로 발신. 현재는 /api/webhooks(목업)로 POST만 하고
// 콘솔/로컬 로그에 적재한다. 나중에 Firebase Functions/실 웹훅 URL로 교체 가능.

export type WebhookEvent =
  | "consult.requested"
  | "consult.accepted"
  | "consult.scheduled"
  | "consult.completed"
  | "consult.declined"
  | "partner.consulting.updated"
  | "store.saved";

export interface WebhookPayload {
  event: WebhookEvent;
  data: Record<string, unknown>;
  at: string;
}

const LOG_KEY = "wdg.webhook.log";

// 클라이언트에서 호출. 실패해도 앱 흐름을 막지 않는다(목업).
export async function emitWebhook(event: WebhookEvent, data: Record<string, unknown>): Promise<void> {
  const payload: WebhookPayload = { event, data, at: new Date().toISOString() };
  // 로컬 로그 적재(개발 가시성)
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(LOG_KEY);
      const log: WebhookPayload[] = raw ? JSON.parse(raw) : [];
      log.unshift(payload);
      localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 50)));
    }
  } catch {
    /* ignore */
  }
  // 목업 수신 엔드포인트로 발신 (멱등/재시도는 실연동 시 구현)
  try {
    await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    /* 목업: 네트워크 실패 무시 */
  }
}

export function readWebhookLog(): WebhookPayload[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

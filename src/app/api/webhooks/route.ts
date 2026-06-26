import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 목업 웹훅 수신기. 실연동 시: 서명 검증 + 멱등키 + Firebase Functions/큐 적재로 교체.
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    // 개발 가시성: 서버 콘솔에 이벤트 기록
    console.log("[webhook]", payload?.event, JSON.stringify(payload?.data ?? {}));
    return NextResponse.json({ received: true, event: payload?.event ?? null });
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, info: "우리동네고수 mock webhook endpoint" });
}

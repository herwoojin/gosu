// 공공데이터 상가/업종 정보 — 클라이언트/서버 공용 타입 + 업종 색상 + 내부 API 호출 헬퍼
// 원천: 소상공인시장진흥공단_상가(상권)정보 API (반경내 상가업소 조회 /storeListInRadius)
//      국토교통부_키스콘 건설업체정보 (선택, 좌표 없음 → 보조 레이어)

import type { LatLng } from "@/types";

// 지도에 찍히는 단일 핀 (업종/주소로 구분)
export interface PublicShop {
  id: string;
  name: string;
  geo: LatLng;
  // 상권업종 분류 (대 → 중 → 소)
  lcls: string; // 대분류명 (색상 기준)
  mcls: string; // 중분류명
  scls: string; // 소분류명
  lclsCd: string; // 대분류코드
  roadAddr: string; // 도로명주소
  lotAddr: string; // 지번주소
  dong: string; // 행정동명
  source: "shop" | "construction"; // 데이터 출처
}

// 상권업종 대분류명 → 핀 색상. 미지정 분류는 hashColor() 폴백.
export const LCLS_COLORS: Record<string, string> = {
  음식: "#EF4444", // red
  소매: "#F59E0B", // amber
  생활서비스: "#10B981", // emerald
  교육: "#3B82F6", // blue
  부동산: "#8B5CF6", // violet
  숙박: "#EC4899", // pink
  "관광/여가/오락": "#06B6D4", // cyan
  스포츠: "#84CC16", // lime
  예술: "#A855F7",
  건설업체: "#0EA5E9", // 키스콘 건설업체 전용
};

const FALLBACK_PALETTE = ["#64748B", "#0891B2", "#CA8A04", "#BE123C", "#4D7C0F", "#7C3AED"];

export function lclsColor(lcls: string): string {
  if (LCLS_COLORS[lcls]) return LCLS_COLORS[lcls];
  let h = 0;
  for (let i = 0; i < lcls.length; i++) h = (h * 31 + lcls.charCodeAt(i)) >>> 0;
  return FALLBACK_PALETTE[h % FALLBACK_PALETTE.length];
}

// 클라이언트 → 내부 프록시 라우트 호출 (서비스키는 서버에서만 사용)
export async function fetchNearbyShops(params: {
  lat: number;
  lng: number;
  radius?: number; // m (최대 2000)
  lcls?: string; // 대분류코드 (예: I2 음식)
  rows?: number;
}): Promise<PublicShop[]> {
  const q = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    radius: String(Math.min(params.radius ?? 1000, 2000)),
    rows: String(params.rows ?? 100),
  });
  if (params.lcls) q.set("lcls", params.lcls);
  const res = await fetch(`/api/public/shops?${q.toString()}`);
  if (!res.ok) throw new Error(`shops ${res.status}`);
  const json = await res.json();
  return json.items as PublicShop[];
}

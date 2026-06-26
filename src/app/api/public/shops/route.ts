// 소상공인시장진흥공단_상가(상권)정보 — 반경내 상가업소 조회 프록시
// /storeListInRadius : cx=경도, cy=위도, radius=m, 업종(대분류코드)으로 필터 가능
// 서비스키(Decoding)는 서버에서만 사용. 미설정 시 데모 핀으로 폴백(데모 모드 일관성).

import { NextRequest, NextResponse } from "next/server";
import type { PublicShop } from "@/lib/publicData";

const BASE = "https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RawItem = {
  bizesId?: string;
  bizesNm?: string;
  indsLclsNm?: string;
  indsLclsCd?: string;
  indsMclsNm?: string;
  indsSclsNm?: string;
  adongNm?: string;
  rdnmAdr?: string;
  lnoAdr?: string;
  lon?: number | string;
  lat?: number | string;
};

function normalize(raw: RawItem[]): PublicShop[] {
  return raw
    .filter((r) => r.lon != null && r.lat != null && r.bizesNm)
    .map((r) => ({
      id: r.bizesId ?? `${r.bizesNm}-${r.lon}-${r.lat}`,
      name: r.bizesNm ?? "",
      geo: { lat: Number(r.lat), lng: Number(r.lon) },
      lcls: r.indsLclsNm ?? "기타",
      mcls: r.indsMclsNm ?? "",
      scls: r.indsSclsNm ?? "",
      lclsCd: r.indsLclsCd ?? "",
      roadAddr: r.rdnmAdr ?? "",
      lotAddr: r.lnoAdr ?? "",
      dong: r.adongNm ?? "",
      source: "shop" as const,
    }));
}

// 키 미설정 시: 좌표 주변에 업종별 데모 핀을 흩뿌려 화면이 빈 채로 보이지 않게 함
function demoShops(lat: number, lng: number): PublicShop[] {
  const seed: Array<[string, string, string]> = [
    ["행복국밥", "음식", "한식 음식점"],
    ["오늘의커피", "음식", "카페"],
    ["우리편의점", "소매", "편의점"],
    ["청춘미용실", "생활서비스", "미용업"],
    ["탄탄헬스장", "스포츠", "체력단련시설"],
    ["365약국", "소매", "의약품 소매"],
    ["베스트학원", "교육", "외국어학원"],
    ["행운부동산", "부동산", "부동산 중개"],
  ];
  return seed.map(([name, lcls, scls], i) => {
    const ang = (i / seed.length) * Math.PI * 2;
    const r = 0.003 + (i % 3) * 0.0015;
    return {
      id: `demo-${i}`,
      name,
      geo: { lat: lat + Math.sin(ang) * r, lng: lng + Math.cos(ang) * r },
      lcls,
      mcls: "",
      scls,
      lclsCd: "",
      roadAddr: "서울특별시 (데모 주소)",
      lotAddr: "",
      dong: "데모동",
      source: "shop" as const,
    };
  });
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }
  const radius = Math.min(Number(sp.get("radius")) || 1000, 2000);
  const rows = Math.min(Number(sp.get("rows")) || 100, 1000);
  const lcls = sp.get("lcls") || "";

  const key = process.env.DATA_GO_KR_API_KEY;
  if (!key) {
    return NextResponse.json({ demo: true, items: demoShops(lat, lng) });
  }

  const q = new URLSearchParams({
    serviceKey: key, // Decoding 키 — URLSearchParams가 인코딩 처리
    radius: String(radius),
    cx: String(lng),
    cy: String(lat),
    numOfRows: String(rows),
    pageNo: "1",
    type: "json",
  });
  if (lcls) q.set("indsLclsCd", lcls);

  try {
    const res = await fetch(`${BASE}?${q.toString()}`, { cache: "no-store" });
    const json = await res.json();
    const body = json?.body ?? {};
    // items 가 배열이거나 {item: [...]} 형태일 수 있어 모두 처리
    const rawItems: RawItem[] = Array.isArray(body.items)
      ? body.items
      : Array.isArray(body.items?.item)
        ? body.items.item
        : [];
    return NextResponse.json({
      total: body.totalCount ?? rawItems.length,
      items: normalize(rawItems),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "upstream", detail: String(e), items: [] },
      { status: 502 }
    );
  }
}

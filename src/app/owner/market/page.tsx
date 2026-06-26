"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { db } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { fetchNearbyShops, lclsColor, type PublicShop } from "@/lib/publicData";
import type { Store } from "@/types";
import { MapPin, Store as StoreIcon, Layers } from "lucide-react";

const MarketMap = dynamic(() => import("@/components/map/MarketMap"), {
  ssr: false,
  loading: () => <div className="grid h-[380px] place-items-center rounded-2xl bg-slate-100 text-sm text-muted">지도 불러오는 중…</div>,
});

const RADII = [500, 1000, 2000];

export default function MarketPage() {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [radius, setRadius] = useState(1000);
  const [shops, setShops] = useState<PublicShop[]>([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Set<string>>(new Set()); // 켜진 업종 대분류 (비어있으면 전체)

  useEffect(() => {
    if (!user) return;
    db.getStore(user.uid === "demo-owner" ? "demo-owner" : user.uid).then(setStore);
  }, [user]);

  useEffect(() => {
    if (!store) return;
    setLoading(true);
    setError(null);
    fetch(`/api/public/shops?lat=${store.geo.lat}&lng=${store.geo.lng}&radius=${radius}&rows=200`)
      .then((r) => r.json())
      .then((j) => {
        setShops(j.items ?? []);
        setDemo(!!j.demo);
        setActive(new Set());
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [store, radius]);

  // 업종 대분류별 집계 (범례 + 필터)
  const groups = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of shops) m.set(s.lcls, (m.get(s.lcls) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [shops]);

  const visible = useMemo(
    () => (active.size === 0 ? shops : shops.filter((s) => active.has(s.lcls))),
    [shops, active]
  );

  const toggle = (lcls: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(lcls) ? next.delete(lcls) : next.add(lcls);
      return next;
    });

  if (!store) {
    return (
      <AppShell title="상권 지도" allow={["OWNER", "ADMIN", "SUPER_ADMIN"]}>
        <Card className="mt-6 text-center">
          <StoreIcon className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-2 text-sm text-muted">먼저 내 점포 위치를 등록해주세요.</p>
          <Link href="/owner/store"><Button className="mt-3">점포 등록</Button></Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="상권 지도" allow={["OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <div className="mt-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-1 text-sm text-ink">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-semibold">{store.name}</span> 주변 상가
        </div>
        <Link href="/owner/store" className="text-xs text-primary">점포 변경</Link>
      </div>

      {/* 반경 선택 */}
      <div className="mt-3 flex gap-2">
        {RADII.map((r) => (
          <button
            key={r}
            onClick={() => setRadius(r)}
            className={`flex-1 rounded-xl border px-2 py-2 text-xs font-semibold ${radius === r ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-muted"}`}
          >
            반경 {r >= 1000 ? `${r / 1000}km` : `${r}m`}
          </button>
        ))}
      </div>

      {demo && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
          데모 데이터입니다. <code>DATA_GO_KR_API_KEY</code> 설정 시 소상공인시장진흥공단 실데이터로 표시됩니다.
        </p>
      )}

      <div className="mt-3">
        <MarketMap store={store.geo} storeName={store.name} shops={visible} />
      </div>
      <p className="mt-1 px-1 text-[10px] text-muted">
        지도 © <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> 기여자 · 상가정보 © 소상공인시장진흥공단
      </p>

      {/* 업종 범례 = 필터 (탭하면 해당 업종만/끄기) */}
      <div className="mt-4 flex items-center gap-1 px-1 text-xs font-semibold text-ink">
        <Layers className="h-4 w-4 text-primary" /> 업종별 ({active.size === 0 ? "전체" : `${visible.length}곳`} / {shops.length}곳)
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {groups.map(([lcls, n]) => {
          const on = active.size === 0 || active.has(lcls);
          return (
            <button
              key={lcls}
              onClick={() => toggle(lcls)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${on ? "border-slate-300 bg-white text-ink" : "border-slate-200 bg-slate-100 text-muted opacity-60"}`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: lclsColor(lcls) }} />
              {lcls} <span className="text-muted">{n}</span>
            </button>
          );
        })}
        {groups.length === 0 && !loading && (
          <span className="text-xs text-muted">{error ? `오류: ${error}` : "주변 상가 정보가 없습니다."}</span>
        )}
        {loading && <span className="text-xs text-muted">불러오는 중…</span>}
      </div>

      {/* 주소별 목록 */}
      <div className="mt-4 space-y-2">
        {visible.slice(0, 60).map((s) => (
          <div key={s.id} className="flex items-start gap-2 rounded-xl border border-slate-100 bg-white p-3">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: lclsColor(s.lcls) }} />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-ink">{s.name}</div>
              <div className="text-xs text-muted">
                {s.lcls}{s.scls ? ` · ${s.scls}` : ""}
              </div>
              <div className="mt-0.5 truncate text-[11px] text-muted">{s.roadAddr || s.lotAddr}</div>
            </div>
          </div>
        ))}
        {visible.length > 60 && (
          <p className="px-1 text-center text-[11px] text-muted">+ {visible.length - 60}곳 더 (지도에서 확인)</p>
        )}
      </div>
    </AppShell>
  );
}

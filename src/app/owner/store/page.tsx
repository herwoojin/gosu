"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card, Button, Input, Select } from "@/components/ui";
import { db } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import type { Store, LatLng } from "@/types";
import { Search, Check, Loader2, MapPin } from "lucide-react";

const StorePicker = dynamic(() => import("@/components/map/StorePicker"), {
  ssr: false,
  loading: () => <div className="grid h-[280px] place-items-center rounded-2xl bg-slate-100 text-sm text-muted">지도 불러오는 중…</div>,
});

const DEFAULT_GEO: LatLng = { lat: 37.4979, lng: 127.0276 }; // 강남역

const STORE_TYPES = ["편의점(GS25)", "편의점(CU)", "편의점(세븐일레븐)", "편의점(이마트24)", "기타 점포"];

export default function StorePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [storeType, setStoreType] = useState(STORE_TYPES[0]);
  const [address, setAddress] = useState("");
  const [geo, setGeo] = useState<LatLng>(DEFAULT_GEO);
  const [searching, setSearching] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    db.getStore(user.uid === "demo-owner" ? "demo-owner" : user.uid).then((s) => {
      if (s) {
        setName(s.name);
        setStoreType(s.storeType);
        setAddress(s.address);
        setGeo(s.geo);
      }
    });
  }, [user]);

  // OSM Nominatim 지오코딩 (베스트 에포트 — 실패 시 지도 클릭으로 직접 지정)
  const geocode = async () => {
    if (!address.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=kr&q=${encodeURIComponent(address)}`,
        { headers: { "Accept-Language": "ko" } }
      );
      const data = (await res.json()) as { lat: string; lon: string }[];
      if (data[0]) setGeo({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
    } catch {
      /* 실패 시 지도 클릭/드래그로 지정 */
    } finally {
      setSearching(false);
    }
  };

  const submit = async () => {
    if (!user) return;
    const store: Store = {
      id: "",
      ownerUid: user.uid === "demo-owner" ? "demo-owner" : user.uid,
      name: name || "내 점포",
      storeType,
      address,
      geo,
    };
    await db.saveStore(store);
    setSaved(true);
    setTimeout(() => router.push("/owner/nearby"), 800);
  };

  return (
    <AppShell title="내 점포" allow={["OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <Card className="mt-3">
        <label className="mb-1.5 block text-sm font-semibold text-ink">점포명</label>
        <Input placeholder="예: GS25 강남역점" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="mb-1.5 mt-3 block text-sm font-semibold text-ink">점포 유형</label>
        <Select value={storeType} onChange={(e) => setStoreType(e.target.value)}>
          {STORE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <label className="mb-1.5 mt-3 block text-sm font-semibold text-ink">주소</label>
        <div className="flex gap-2">
          <Input placeholder="도로명 주소 입력 후 검색" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Button onClick={geocode} disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      <div className="mt-4 flex items-center gap-1 px-1 text-xs text-muted">
        <MapPin className="h-3.5 w-3.5" /> 지도를 탭하거나 핀을 드래그해 정확한 위치를 지정하세요
      </div>
      <div className="mt-2">
        <StorePicker value={geo} onChange={setGeo} />
      </div>
      <p className="mt-1 px-1 text-[10px] text-muted">
        지도 © <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> 기여자 ·
        검색 Nominatim(OSM)
      </p>
      <div className="mt-1 px-1 text-[11px] text-muted">좌표: {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}</div>

      <Button size="lg" className="mt-5 w-full" onClick={submit} disabled={saved}>
        {saved ? <><Check className="h-5 w-5" /> 저장됨</> : "점포 저장하고 근처 고수 보기"}
      </Button>
    </AppShell>
  );
}

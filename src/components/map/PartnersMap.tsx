"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/types";
import type { NearbyPartner } from "@/lib/data";
import { formatDistance } from "@/lib/geo";

// divIcon HTML 마커 (번들러에서 기본 마커 이미지 깨짐 회피)
function pin(color: string, label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-4px)">
      <div style="background:${color};color:#fff;font-size:11px;font-weight:700;padding:2px 7px;border-radius:999px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.25)">${label}</div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${color};margin-top:-1px"></div>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

// 모든 지점이 보이도록 지도 범위를 맞춘다. fitKey 가 바뀌면 다시 맞춘다.
function FitBounds({ points, fitKey }: { points: LatLng[]; fitKey: number }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, points, fitKey]);
  return null;
}

// 컨테이너 높이가 바뀌면 Leaflet 에 알려 타일/마커 위치를 다시 계산한다.
function ResizeOnHeight({ height }: { height: number }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 220); // 높이 전환 애니메이션 후
    return () => clearTimeout(t);
  }, [map, height]);
  return null;
}

const COLLAPSED_H = 320;
const EXPANDED_H = 560;

export default function PartnersMap({
  store,
  storeName,
  partners,
  selectedId,
  onSelect,
}: {
  store: LatLng;
  storeName: string;
  partners: NearbyPartner[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const points = useMemo(
    () => [store, ...partners.map((p) => p.partner.geo)],
    [store, partners]
  );

  const [expanded, setExpanded] = useState(false);
  const [fitKey, setFitKey] = useState(0);
  const height = expanded ? EXPANDED_H : COLLAPSED_H;

  // 높이가 바뀌면 전체가 다시 잘 보이도록 범위를 한 번 더 맞춘다.
  const prevExpanded = useRef(expanded);
  useEffect(() => {
    if (prevExpanded.current !== expanded) {
      prevExpanded.current = expanded;
      const t = setTimeout(() => setFitKey((k) => k + 1), 240);
      return () => clearTimeout(t);
    }
  }, [expanded]);

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-card transition-[height] duration-200 ease-out" style={{ height }}>
      <MapContainer
        center={[store.lat, store.lng]}
        zoom={14}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        {/* OpenStreetMap 표준 타일 + 저작권 표기 의무 준수 */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <FitBounds points={points} fitKey={fitKey} />
        <ResizeOnHeight height={height} />

        <Marker position={[store.lat, store.lng]} icon={pin("#2563EB", "내 점포")}>
          <Popup>{storeName}</Popup>
        </Marker>

        {partners.map(({ partner, distanceM }) => (
          <Marker
            key={partner.id}
            position={[partner.geo.lat, partner.geo.lng]}
            icon={pin(selectedId === partner.id ? "#DC2626" : "#16A34A", partner.name)}
            eventHandlers={{ click: () => onSelect?.(partner.id) }}
          >
            <Popup>
              <b>{partner.name}</b>
              <br />
              {formatDistance(distanceM)} · ★ {partner.rating.toFixed(1)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 우상단 컨트롤: 전체 보기 + 높이 확장/축소 */}
      <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setFitKey((k) => k + 1)}
          className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-card backdrop-blur hover:bg-white"
          title="전체 지도 보기"
        >
          전체 보기
        </button>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-card backdrop-blur hover:bg-white"
          title={expanded ? "지도 축소" : "지도 확대"}
        >
          {expanded ? "▲ 축소" : "▼ 확대"}
        </button>
      </div>
    </div>
  );
}

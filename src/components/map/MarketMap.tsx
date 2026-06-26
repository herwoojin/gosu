"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/types";
import { type PublicShop, lclsColor } from "@/lib/publicData";

// 내 점포 핀 (라벨형)
function storePin() {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-4px)">
      <div style="background:#2563EB;color:#fff;font-size:11px;font-weight:700;padding:2px 7px;border-radius:999px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.25)">내 점포</div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #2563EB;margin-top:-1px"></div>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function FitBounds({ points, fitKey }: { points: LatLng[]; fitKey: number }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 17 });
  }, [map, points, fitKey]);
  return null;
}

function ResizeOnHeight({ height }: { height: number }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 220);
    return () => clearTimeout(t);
  }, [map, height]);
  return null;
}

const COLLAPSED_H = 380;
const EXPANDED_H = 620;

export default function MarketMap({
  store,
  storeName,
  shops,
}: {
  store: LatLng;
  storeName: string;
  shops: PublicShop[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [fitKey, setFitKey] = useState(0);
  const height = expanded ? EXPANDED_H : COLLAPSED_H;

  const points = useMemo(
    () => [store, ...shops.map((s) => s.geo)],
    [store, shops]
  );

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-card transition-[height] duration-200 ease-out" style={{ height }}>
      <MapContainer center={[store.lat, store.lng]} zoom={15} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <FitBounds points={points} fitKey={fitKey} />
        <ResizeOnHeight height={height} />

        <Marker position={[store.lat, store.lng]} icon={storePin()}>
          <Popup>{storeName}</Popup>
        </Marker>

        {shops.map((s) => {
          const color = lclsColor(s.lcls);
          return (
            <CircleMarker
              key={s.id}
              center={[s.geo.lat, s.geo.lng]}
              radius={6}
              pathOptions={{ color: "#fff", weight: 1.5, fillColor: color, fillOpacity: 0.9 }}
            >
              <Popup>
                <b>{s.name}</b>
                <br />
                <span style={{ color }}>● {s.lcls}</span>
                {s.scls && ` · ${s.scls}`}
                <br />
                {s.roadAddr || s.lotAddr}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

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

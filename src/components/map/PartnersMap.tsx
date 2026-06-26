"use client";

import { useEffect, useMemo } from "react";
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

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, points]);
  return null;
}

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

  return (
    <div className="overflow-hidden rounded-2xl shadow-card" style={{ height: 320 }}>
      <MapContainer
        center={[store.lat, store.lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        {/* OpenStreetMap 표준 타일 + 저작권 표기 의무 준수 */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <FitBounds points={points} />

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
    </div>
  );
}

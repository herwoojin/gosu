"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/types";

const storeIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-4px)">
    <div style="background:#2563EB;color:#fff;font-size:11px;font-weight:700;padding:2px 7px;border-radius:999px;box-shadow:0 1px 4px rgba(0,0,0,.25)">내 점포</div>
    <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #2563EB;margin-top:-1px"></div>
  </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

function Recenter({ pos }: { pos: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([pos.lat, pos.lng]);
  }, [map, pos]);
  return null;
}

function ClickHandler({ onChange }: { onChange: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function StorePicker({ value, onChange }: { value: LatLng; onChange: (p: LatLng) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl shadow-card" style={{ height: 280 }}>
      <MapContainer center={[value.lat, value.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Recenter pos={value} />
        <ClickHandler onChange={onChange} />
        <Marker
          position={[value.lat, value.lng]}
          icon={storeIcon}
          draggable
          eventHandlers={{
            dragend(e) {
              const m = e.target as L.Marker;
              const ll = m.getLatLng();
              onChange({ lat: ll.lat, lng: ll.lng });
            },
          }}
        />
      </MapContainer>
    </div>
  );
}

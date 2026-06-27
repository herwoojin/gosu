"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { phase2db } from "@/lib/phase2";
import { demoStore } from "@/lib/demo-data";
import type { OfflineVenue } from "@/types/phase2";
import { Building2, Plus, MapPin, Users } from "lucide-react";

export default function VenuesPage() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<OfflineVenue[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", capacity: "20", facilities: "" });

  const reload = () => phase2db.listVenues().then(setVenues);
  useEffect(() => { reload(); }, []);

  const create = async () => {
    if (!user || !form.name) return;
    await phase2db.createVenue({
      ownerUid: user.uid, name: form.name, address: form.address, geo: demoStore.geo,
      capacity: Number(form.capacity) || 0, facilities: form.facilities.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setOpen(false);
    setForm({ name: "", address: "", capacity: "20", facilities: "" });
    reload();
  };

  return (
    <AppShell title="오프라인 거점">
      <Card className="mt-2 flex items-center gap-2 bg-primary-soft">
        <Building2 className="h-5 w-5 text-primary" />
        <p className="text-xs text-primary">남는 임대공간을 <b>교육·커뮤니티·판매 거점</b>으로. 캠프 오프라인 수업·고수 상품 픽업에 연계됩니다.</p>
      </Card>

      {!open && <Button className="mt-3 w-full" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> 거점 등록</Button>}
      {open && (
        <Card className="mt-3 space-y-2">
          <Input placeholder="거점 이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="주소" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input type="number" inputMode="numeric" placeholder="수용 인원" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          <Input placeholder="시설 (쉼표로 구분: 공유주방, 공구실...)" value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>취소</Button>
            <Button className="flex-[2]" onClick={create}>등록</Button>
          </div>
        </Card>
      )}

      <h2 className="mb-2 mt-6 px-1 text-lg font-bold text-ink">등록된 거점 ({venues.length})</h2>
      <div className="space-y-2">
        {venues.map((v) => (
          <Card key={v.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-bold text-ink">{v.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                  <span className="flex items-center gap-0.5"><MapPin className="h-3.5 w-3.5" /> {v.address}</span>
                  <span className="flex items-center gap-0.5"><Users className="h-3.5 w-3.5" /> {v.capacity}명</span>
                </div>
              </div>
              <Badge tone={v.status === "active" ? "success" : "neutral"}>{v.status === "active" ? "운영중" : "일시정지"}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {v.facilities.map((f) => <span key={f} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-muted">{f}</span>)}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

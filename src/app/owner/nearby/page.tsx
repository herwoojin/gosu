"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, Select, Textarea, Input } from "@/components/ui";
import { db, type NearbyPartner } from "@/lib/data";
import { categories } from "@/lib/demo-data";
import { formatDistance } from "@/lib/geo";
import { formatKRW } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import type { Store, ConsultMode, PartnerProfile } from "@/types";
import { Star, Phone, MapPin, HeartHandshake, Car, Check, Store as StoreIcon } from "lucide-react";

const PartnersMap = dynamic(() => import("@/components/map/PartnersMap"), {
  ssr: false,
  loading: () => <div className="grid h-[320px] place-items-center rounded-2xl bg-slate-100 text-sm text-muted">지도 불러오는 중…</div>,
});

type Filter = "all" | "free_as" | "paid_visit";

export default function NearbyPage() {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [categoryId, setCategoryId] = useState<string>("");
  const [list, setList] = useState<NearbyPartner[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [consultFor, setConsultFor] = useState<PartnerProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    db.getStore(user.uid === "demo-owner" ? "demo-owner" : user.uid).then(setStore);
  }, [user]);

  useEffect(() => {
    if (!store) return;
    db.getNearbyPartners(store.geo, {
      categoryId: categoryId || undefined,
      mode: filter === "all" ? undefined : filter,
    }).then(setList);
  }, [store, filter, categoryId]);

  const selectedItem = useMemo(() => list.find((l) => l.partner.id === selected), [list, selected]);

  if (!store) {
    return (
      <AppShell title="근처 고수" allow={["OWNER", "ADMIN", "SUPER_ADMIN"]}>
        <Card className="mt-6 text-center">
          <StoreIcon className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-2 text-sm text-muted">먼저 내 점포 위치를 등록해주세요.</p>
          <Link href="/owner/store"><Button className="mt-3">점포 등록</Button></Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="근처 고수" allow={["OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <div className="mt-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-1 text-sm text-ink">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-semibold">{store.name}</span>
        </div>
        <Link href="/owner/store" className="text-xs text-primary">점포 변경</Link>
      </div>

      {/* 필터 */}
      <div className="mt-3 flex gap-2">
        {(["all", "free_as", "paid_visit"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-xl border px-2 py-2 text-xs font-semibold ${filter === f ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-muted"}`}
          >
            {f === "all" ? "전체" : f === "free_as" ? "무료 AS" : "유료 출장"}
          </button>
        ))}
      </div>
      <Select className="mt-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">전체 공종</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>

      <div className="mt-3">
        <PartnersMap store={store.geo} storeName={store.name} partners={list} selectedId={selected} onSelect={setSelected} />
      </div>
      <p className="mt-1 px-1 text-[10px] text-muted">
        지도 © <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> 기여자
      </p>

      <h2 className="mb-2 mt-5 px-1 text-lg font-bold text-ink">가까운 고수 {list.length}명</h2>
      <div className="space-y-3">
        {list.map(({ partner, distanceM }) => (
          <Card key={partner.id} className={selected === partner.id ? "ring-2 ring-primary" : ""}>
            <div className="flex items-start justify-between" onClick={() => setSelected(partner.id)}>
              <div>
                <div className="text-sm font-bold text-ink">{partner.name}</div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-0.5 text-warn"><Star className="h-3.5 w-3.5 fill-current" /> {partner.rating.toFixed(1)}</span>
                  <span className="flex items-center gap-0.5"><MapPin className="h-3.5 w-3.5" /> {formatDistance(distanceM)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {partner.consulting.offersFreeAs && <Badge tone="success">무료 AS</Badge>}
                {partner.consulting.offersPaidVisit && <Badge tone="primary">출장 {formatKRW(partner.consulting.visitFee)}</Badge>}
              </div>
            </div>
            {partner.consulting.note && <p className="mt-2 text-xs text-muted">{partner.consulting.note}</p>}
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <a href={`tel:${partner.phone}`} className="flex h-11 flex-1 items-center justify-center gap-1 rounded-xl border border-slate-300 text-sm font-semibold text-ink">
                <Phone className="h-4 w-4" /> 전화
              </a>
              <Button className="flex-[2]" onClick={() => setConsultFor(partner)}>
                <HeartHandshake className="h-4 w-4" /> 컨설팅 요청
              </Button>
            </div>
          </Card>
        ))}
        {list.length === 0 && <Card className="text-center text-sm text-muted">조건에 맞는 고수가 없습니다.</Card>}
      </div>

      {consultFor && store && (
        <ConsultModal partner={consultFor} store={store} categoryId={categoryId} onClose={() => setConsultFor(null)} />
      )}
    </AppShell>
  );
}

function ConsultModal({
  partner,
  store,
  categoryId,
  onClose,
}: {
  partner: PartnerProfile;
  store: Store;
  categoryId: string;
  onClose: () => void;
}) {
  const modes: ConsultMode[] = [
    ...(partner.consulting.offersFreeAs ? (["free_as"] as ConsultMode[]) : []),
    ...(partner.consulting.offersPaidVisit ? (["paid_visit"] as ConsultMode[]) : []),
  ];
  const [mode, setMode] = useState<ConsultMode>(modes[0]);
  const [message, setMessage] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [done, setDone] = useState(false);

  const fee = mode === "paid_visit" ? partner.consulting.visitFee : 0;

  const submit = async () => {
    await db.createConsultRequest({
      storeId: store.id,
      ownerUid: store.ownerUid,
      partnerId: partner.id,
      partnerName: partner.name,
      categoryId: categoryId || undefined,
      mode,
      fee,
      message,
      preferredTime: preferredTime || undefined,
    });
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-[480px] rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="py-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-50 text-success"><Check className="h-7 w-7" /></span>
            <h3 className="mt-3 text-lg font-bold text-ink">컨설팅 요청 완료</h3>
            <p className="mt-1 text-sm text-muted">{partner.name} 고수에게 요청이 전달되었습니다.</p>
            <Button className="mt-5 w-full" size="lg" onClick={onClose}>확인</Button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-ink">{partner.name} 컨설팅 요청</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {modes.includes("free_as") && (
                <ModeBtn active={mode === "free_as"} onClick={() => setMode("free_as")} icon={HeartHandshake} title="무료 AS 컨설팅" sub="원격·전화·사진 진단" />
              )}
              {modes.includes("paid_visit") && (
                <ModeBtn active={mode === "paid_visit"} onClick={() => setMode("paid_visit")} icon={Car} title="유료 출장 컨설팅" sub={formatKRW(partner.consulting.visitFee)} />
              )}
            </div>
            <label className="mb-1 mt-4 block text-sm font-semibold text-ink">요청 내용</label>
            <Textarea placeholder="증상·궁금한 점을 적어주세요" value={message} onChange={(e) => setMessage(e.target.value)} />
            <label className="mb-1 mt-3 block text-sm font-semibold text-ink">희망 시간 (선택)</label>
            <Input placeholder="예: 평일 오전" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} />
            {mode === "paid_visit" && (
              <p className="mt-2 text-[11px] text-muted">출장비 {formatKRW(fee)}는 협력사 수락 후 협의·결제됩니다. (목업)</p>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>취소</Button>
              <Button className="flex-[2]" size="md" onClick={submit}>요청 보내기</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ModeBtn({
  active, onClick, icon: Icon, title, sub,
}: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; title: string; sub: string }) {
  return (
    <button onClick={onClick} className={`rounded-2xl border p-3 text-left ${active ? "border-primary bg-primary-soft" : "border-slate-200 bg-white"}`}>
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-1.5 text-sm font-bold text-ink">{title}</div>
      <div className="text-xs text-muted">{sub}</div>
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, Input, Select } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { phase2db } from "@/lib/phase2";
import { formatKRW } from "@/lib/utils";
import type { Shop, Product, ProductKind } from "@/types/phase2";
import { Store, Plus, ShieldCheck, ShieldAlert, Utensils, Package, Wrench } from "lucide-react";

const KIND_META: Record<ProductKind, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  service: { label: "서비스", icon: Wrench },
  goods: { label: "물품", icon: Package },
  food: { label: "음식", icon: Utensils },
};

export default function ShopPage() {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kind: "goods" as ProductKind, title: "", price: "10000" });

  const reload = async () => {
    if (!user) return;
    const s = await phase2db.getShop(user.uid);
    setShop(s);
    if (s) setProducts(await phase2db.listProducts(s.id));
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [user]);

  const add = async () => {
    if (!shop || !form.title) return;
    await phase2db.addProduct({ shopId: shop.id, kind: form.kind, title: form.title, price: Number(form.price) || 0 });
    setOpen(false);
    setForm({ ...form, title: "" });
    reload();
  };
  const verify = async (id: string) => { await phase2db.verifyProduct(id); reload(); };

  if (!shop) {
    return (
      <AppShell title="내 상점">
        <Card className="mt-6 text-center">
          <Store className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-2 text-sm text-muted">아직 상점이 없습니다. (데모 계정으로 로그인하면 샘플 상점이 보입니다)</p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="1인 커머스">
      <Card className="mt-2">
        <div className="flex items-center gap-2">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary"><Store className="h-5 w-5" /></span>
          <div>
            <div className="text-sm font-bold text-ink">{shop.brandName}</div>
            <div className="text-xs text-muted">{shop.intro}</div>
          </div>
        </div>
      </Card>

      {!open && <Button className="mt-3 w-full" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> 상품 등록</Button>}
      {open && (
        <Card className="mt-3 space-y-2">
          <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as ProductKind })}>
            <option value="service">서비스</option>
            <option value="goods">물품</option>
            <option value="food">음식 (영업신고 검증 필요)</option>
          </Select>
          <Input placeholder="상품명" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input type="number" inputMode="numeric" placeholder="가격(원)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          {form.kind === "food" && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
              ⚠️ 음식은 <b>영업신고증(식품위생법) 검증</b>을 통과해야 판매가 활성화됩니다. (공유주방 옵션 안내)
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>취소</Button>
            <Button className="flex-[2]" onClick={add}>등록</Button>
          </div>
        </Card>
      )}

      <h2 className="mb-2 mt-6 px-1 text-lg font-bold text-ink">내 상품 ({products.length})</h2>
      <div className="space-y-2">
        {products.map((p) => {
          const M = KIND_META[p.kind];
          return (
            <Card key={p.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-muted"><M.icon className="h-4 w-4" /></span>
                  <div>
                    <div className="text-sm font-bold text-ink">{p.title}</div>
                    <div className="text-xs text-muted">{M.label} · {formatKRW(p.price)}</div>
                  </div>
                </div>
                {p.active ? <Badge tone="success">판매중</Badge> : <Badge tone="warn">검증 대기</Badge>}
              </div>
              {p.kind === "food" && !p.verified && (
                <button onClick={() => verify(p.id)} className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-amber-300 bg-amber-50 py-2 text-xs font-semibold text-amber-700">
                  <ShieldAlert className="h-4 w-4" /> 영업신고증 검증하기 (데모)
                </button>
              )}
              {p.verified && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-success"><ShieldCheck className="h-3.5 w-3.5" /> 영업신고·통신판매 검증 완료</div>
              )}
            </Card>
          );
        })}
      </div>

      <p className="mt-4 px-1 text-[11px] leading-relaxed text-muted">
        통신판매업 신고·표시광고 진실성 준수. 결제는 Phase 1 라이선스 PG를 재사용하며 플랫폼은 자금을 보관하지 않습니다.
      </p>
    </AppShell>
  );
}

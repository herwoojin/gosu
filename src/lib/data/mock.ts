import type {
  PartnerProfile,
  Store,
  ConsultRequest,
  ConsultingOptions,
  ConsultStatus,
  LatLng,
  ConsultMode,
} from "@/types";
import { demoPartners, demoStore, demoConsultRequests } from "@/lib/demo-data";
import { haversineM } from "@/lib/geo";
import { emitWebhook } from "./webhook";
import type { DataProvider, NearbyPartner } from "./provider";

// localStorage 키 — Firebase 전환 시 Firestore 컬렉션으로 매핑.
const K_STORE = "wdg.mock.stores";
const K_PARTNER_OVERRIDE = "wdg.mock.partnerConsulting";
const K_CONSULTS = "wdg.mock.consults";

function load<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, value: T) {
  try {
    if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// 협력사 + 컨설팅 옵션 오버라이드 병합
function mergedPartners(): PartnerProfile[] {
  const overrides = load<Record<string, ConsultingOptions>>(K_PARTNER_OVERRIDE, {});
  return demoPartners.map((p) => (overrides[p.id] ? { ...p, consulting: overrides[p.id] } : p));
}

export const mockProvider: DataProvider = {
  async getStore(ownerUid) {
    const stores = load<Store[]>(K_STORE, [demoStore]);
    return stores.find((s) => s.ownerUid === ownerUid) ?? (ownerUid === "demo-owner" ? demoStore : null);
  },

  async saveStore(store) {
    const stores = load<Store[]>(K_STORE, [demoStore]);
    const idx = stores.findIndex((s) => s.ownerUid === store.ownerUid);
    const next: Store = { ...store, id: store.id || id("s") };
    if (idx >= 0) stores[idx] = next;
    else stores.push(next);
    save(K_STORE, stores);
    await emitWebhook("store.saved", { storeId: next.id, ownerUid: next.ownerUid });
    return next;
  },

  async listPartners() {
    return mergedPartners();
  },

  async getPartner(pid) {
    return mergedPartners().find((p) => p.id === pid) ?? null;
  },

  async savePartnerConsulting(partnerId, opts) {
    const overrides = load<Record<string, ConsultingOptions>>(K_PARTNER_OVERRIDE, {});
    overrides[partnerId] = opts;
    save(K_PARTNER_OVERRIDE, overrides);
    await emitWebhook("partner.consulting.updated", { partnerId, opts });
  },

  async getNearbyPartners(origin: LatLng, opts) {
    const { categoryId, mode, limit = 30 } = opts ?? {};
    return mergedPartners()
      .filter((p) => p.status === "approved")
      .filter((p) => (categoryId ? p.categoryIds.includes(categoryId) : true))
      .filter((p) => {
        if (mode === "free_as") return p.consulting.offersFreeAs;
        if (mode === "paid_visit") return p.consulting.offersPaidVisit;
        return true;
      })
      .map<NearbyPartner>((partner) => ({ partner, distanceM: haversineM(origin, partner.geo) }))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, limit);
  },

  async listConsultRequests(filter) {
    const stored = load<ConsultRequest[]>(K_CONSULTS, demoConsultRequests);
    return stored
      .filter((c) => (filter.ownerUid ? c.ownerUid === filter.ownerUid : true))
      .filter((c) => (filter.partnerId ? c.partnerId === filter.partnerId : true))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },

  async createConsultRequest(input) {
    const stored = load<ConsultRequest[]>(K_CONSULTS, demoConsultRequests);
    const req: ConsultRequest = {
      ...input,
      id: id("cr"),
      status: "requested",
      createdAt: new Date().toISOString(),
    };
    stored.unshift(req);
    save(K_CONSULTS, stored);
    await emitWebhook("consult.requested", {
      consultId: req.id,
      partnerId: req.partnerId,
      mode: req.mode,
      fee: req.fee,
    });
    return req;
  },

  async updateConsultStatus(cid, status: ConsultStatus) {
    const stored = load<ConsultRequest[]>(K_CONSULTS, demoConsultRequests);
    const idx = stored.findIndex((c) => c.id === cid);
    if (idx >= 0) {
      stored[idx] = { ...stored[idx], status };
      save(K_CONSULTS, stored);
      await emitWebhook(`consult.${status}` as any, { consultId: cid });
    }
  },
};

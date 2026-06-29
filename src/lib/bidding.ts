// 협력사 등록 + 3자 계약 mock 스토어 (localStorage). Phase 1 db 패턴과 동일하게 async.
"use client";

import type {
  PartnerRegistration,
  Contract,
  ContractParty,
  SpecialClause,
} from "@/types/contract";

const K = {
  reg: "wdg.bid.registrations",
  contracts: "wdg.bid.contracts",
  completed: "wdg.bid.completed",
};

// 이 사이트를 통해 완료한 작업 수 (데모 시드). 계약 체결(서명완료) 시 증가.
const COMPLETED_SEED: Record<string, number> = {
  "demo-partner": 17,
  "p-1": 24,
  "p-2": 11,
  "p-3": 5,
  "demo-mentor": 9,
};

const DEFAULT_BASE_TERMS = [
  "작업 범위는 견적요청 내용과 협력사의 입찰 제안 내역에 따른다.",
  "대금은 낙찰 금액을 기준으로 하며, 선택한 결제수단(즉시결제/본부결제) 절차에 따라 지급한다.",
  "협력사는 작업 완료일로부터 7일 이내 하자에 대해 무상 보수 책임을 진다.",
  "협력사는 산업안전·보험 및 관계 법령을 준수하며, 사고에 대한 책임을 진다.",
  "본 계약은 통신판매중개 거래로, 작업 이행·품질에 대한 책임은 거래 당사자에게 있다.",
];

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
function rid(p: string) {
  return `${p}-${Math.random().toString(36).slice(2, 9)}`;
}
const nowIso = () => new Date().toISOString();

export const biddingDb = {
  // ── 협력사 등록 ──
  async getRegistration(uid: string): Promise<PartnerRegistration | null> {
    return load<PartnerRegistration[]>(K.reg, []).find((r) => r.uid === uid) ?? null;
  },
  async isRegistered(uid: string): Promise<boolean> {
    return !!(await this.getRegistration(uid));
  },
  async saveRegistration(reg: PartnerRegistration): Promise<PartnerRegistration> {
    const all = load<PartnerRegistration[]>(K.reg, []);
    const idx = all.findIndex((r) => r.uid === reg.uid);
    const next = { ...reg, registeredAt: reg.registeredAt || nowIso() };
    if (idx >= 0) all[idx] = next;
    else all.push(next);
    save(K.reg, all);
    return next;
  },

  // ── 완료 작업 수 ──
  completedJobs(key: string): number {
    const overrides = load<Record<string, number>>(K.completed, {});
    return overrides[key] ?? COMPLETED_SEED[key] ?? 0;
  },
  incCompleted(key: string) {
    const overrides = load<Record<string, number>>(K.completed, {});
    overrides[key] = (overrides[key] ?? COMPLETED_SEED[key] ?? 0) + 1;
    save(K.completed, overrides);
  },

  // ── 계약 ──
  async listContracts(filter?: { ownerUid?: string; partnerUid?: string }): Promise<Contract[]> {
    let all = load<Contract[]>(K.contracts, []);
    if (filter?.ownerUid) all = all.filter((c) => c.ownerUid === filter.ownerUid);
    if (filter?.partnerUid) all = all.filter((c) => c.partnerUid === filter.partnerUid);
    return [...all].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },
  async getContract(id: string): Promise<Contract | null> {
    return load<Contract[]>(K.contracts, []).find((c) => c.id === id) ?? null;
  },
  async createContract(input: {
    requestId: string;
    requestTitle: string;
    categoryName: string;
    amount: number;
    ownerUid: string;
    ownerName: string;
    adminName: string;
    partnerId: string;
    partnerUid: string;
    partnerName: string;
  }): Promise<Contract> {
    const all = load<Contract[]>(K.contracts, []);
    const c: Contract = {
      ...input,
      id: rid("ct"),
      baseTerms: [...DEFAULT_BASE_TERMS],
      clauses: [],
      signatures: [],
      status: "drafting",
      createdAt: nowIso(),
    };
    save(K.contracts, [c, ...all]);
    return c;
  },
  async _update(id: string, fn: (c: Contract) => Contract): Promise<Contract | null> {
    const all = load<Contract[]>(K.contracts, []);
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return null;
    all[idx] = fn(all[idx]);
    save(K.contracts, all);
    return all[idx];
  },

  // 특약 추가/수정/삭제 (경영주·본부, drafting/revision_requested 단계)
  async addClause(id: string, party: "owner" | "admin", text: string) {
    return this._update(id, (c) => ({
      ...c,
      clauses: [...c.clauses, { id: rid("cl"), party, text, status: "proposed" } as SpecialClause],
    }));
  },
  async editClause(id: string, clauseId: string, text: string) {
    return this._update(id, (c) => ({
      ...c,
      clauses: c.clauses.map((cl) =>
        cl.id === clauseId ? { ...cl, text, status: "proposed", revisionNote: undefined } : cl
      ),
    }));
  },
  async removeClause(id: string, clauseId: string) {
    return this._update(id, (c) => ({ ...c, clauses: c.clauses.filter((cl) => cl.id !== clauseId) }));
  },

  // 협력사에 검토 요청
  async sendToReview(id: string) {
    return this._update(id, (c) => ({ ...c, status: "partner_review" }));
  },

  // 협력사: 특약 수용 / 수정요청
  async respondClause(id: string, clauseId: string, action: "accept" | "revise", note?: string) {
    return this._update(id, (c) => {
      const clauses = c.clauses.map((cl) =>
        cl.id === clauseId
          ? { ...cl, status: action === "accept" ? "accepted" : "revision_requested", revisionNote: action === "revise" ? note : undefined } as SpecialClause
          : cl
      );
      const anyRevision = clauses.some((cl) => cl.status === "revision_requested");
      return { ...c, clauses, status: anyRevision ? "revision_requested" : c.status };
    });
  },

  // 협력사: 모든 특약 수용 후 최종 승인 → 서명 단계
  async partnerApprove(id: string) {
    return this._update(id, (c) => {
      const ok = c.clauses.every((cl) => cl.status === "accepted");
      return ok ? { ...c, status: "signing" } : c;
    });
  },

  // 디지털 서명 (정자체 이름). 3자 모두 서명 시 체결 완료 + 완료작업수 증가.
  async sign(id: string, party: ContractParty, name: string) {
    return this._update(id, (c) => {
      const signatures = [
        ...c.signatures.filter((s) => s.party !== party),
        { party, name, signedAt: nowIso() },
      ];
      const allSigned = ["owner", "admin", "partner"].every((p) => signatures.some((s) => s.party === p));
      if (allSigned && c.status !== "signed") {
        this.incCompleted(c.partnerId);
        if (c.partnerUid && c.partnerUid !== c.partnerId) this.incCompleted(c.partnerUid);
      }
      return { ...c, signatures, status: allSigned ? "signed" : c.status };
    });
  },
};

export type BiddingDb = typeof biddingDb;

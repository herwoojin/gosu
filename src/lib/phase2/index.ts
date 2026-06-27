// Phase 2 데이터 어댑터 — mock(localStorage). Phase 1 db 패턴과 동일.
// 모든 메서드 async — Firebase/Supabase 전환 시 구현만 교체.
"use client";

import type {
  SkillProfile,
  Course,
  Cohort,
  Enrollment,
  TrustScore,
  RelocationProgram,
  RelocationApp,
  Voucher,
  Shop,
  Product,
  SocialAccount,
  SocialPost,
  OfflineVenue,
  GlobalWorkerProfile,
  SkillKind,
} from "@/types/phase2";
import {
  demoSkills, demoCourses, demoCohorts, demoEnrollments, demoTrustScores,
  demoRelocationPrograms, demoRelocationApps, demoVouchers, demoShops, demoProducts,
  demoSocialAccounts, demoSocialPosts, demoVenues, demoGlobalProfiles, demoFieldEarnings,
} from "./demo";

const K = {
  skills: "wdg.p2.skills",
  enroll: "wdg.p2.enrollments",
  relocApps: "wdg.p2.relocApps",
  vouchers: "wdg.p2.vouchers",
  programs: "wdg.p2.programs",
  products: "wdg.p2.products",
  posts: "wdg.p2.posts",
  venues: "wdg.p2.venues",
  global: "wdg.p2.global",
  courses: "wdg.p2.courses",
};

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

export const phase2db = {
  // ── M1 스킬 ──
  async listSkills(uid: string): Promise<SkillProfile[]> {
    return load<SkillProfile[]>(K.skills, demoSkills).filter((s) => s.uid === uid);
  },
  async addSkill(input: { uid: string; categoryId: string; kind: SkillKind; level?: number; note?: string }): Promise<SkillProfile> {
    const all = load<SkillProfile[]>(K.skills, demoSkills);
    const sk: SkillProfile = {
      id: rid("sk"), uid: input.uid, categoryId: input.categoryId, kind: input.kind,
      level: input.level ?? 0, note: input.note, createdAt: nowIso(),
    };
    save(K.skills, [...all.filter((s) => !(s.uid === sk.uid && s.categoryId === sk.categoryId && s.kind === sk.kind)), sk]);
    return sk;
  },
  async removeSkill(id: string): Promise<void> {
    const all = load<SkillProfile[]>(K.skills, demoSkills);
    save(K.skills, all.filter((s) => s.id !== id));
  },
  async fieldEarnings() {
    return demoFieldEarnings;
  },

  // ── M2 캠프 ──
  async listCourses(): Promise<Course[]> {
    return load<Course[]>(K.courses, demoCourses);
  },
  async getCourse(id: string): Promise<Course | null> {
    return load<Course[]>(K.courses, demoCourses).find((c) => c.id === id) ?? null;
  },
  async createCourse(input: Omit<Course, "id" | "createdAt" | "status"> & { status?: Course["status"] }): Promise<Course> {
    const all = load<Course[]>(K.courses, demoCourses);
    const c: Course = { ...input, status: input.status ?? "open", id: rid("co"), createdAt: nowIso() };
    save(K.courses, [c, ...all]);
    return c;
  },
  async cohortsFor(courseId: string): Promise<Cohort[]> {
    return demoCohorts.filter((c) => c.courseId === courseId);
  },
  async listEnrollments(uid: string): Promise<Enrollment[]> {
    return load<Enrollment[]>(K.enroll, demoEnrollments).filter((e) => e.uid === uid);
  },
  async enroll(input: { uid: string; cohortId: string; courseId: string }): Promise<Enrollment> {
    const all = load<Enrollment[]>(K.enroll, demoEnrollments);
    const e: Enrollment = {
      id: rid("en"), uid: input.uid, cohortId: input.cohortId, courseId: input.courseId,
      status: "enrolled", progress: 0, createdAt: nowIso(),
    };
    save(K.enroll, [e, ...all]);
    return e;
  },
  // 수료 처리 → 수료증 발급(데모) → 해당 분야 고수 활동 자동 활성화 신호
  async completeEnrollment(id: string): Promise<Enrollment | null> {
    const all = load<Enrollment[]>(K.enroll, demoEnrollments);
    const idx = all.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    all[idx] = { ...all[idx], status: "completed", progress: 100, completedAt: nowIso(), certUrl: `cert://${id}` };
    save(K.enroll, all);
    return all[idx];
  },

  // ── M3 점수 ──
  async listTrustScores(): Promise<TrustScore[]> {
    return demoTrustScores;
  },
  async getTrustScore(uid: string): Promise<TrustScore | null> {
    return demoTrustScores.find((t) => t.uid === uid) ?? demoTrustScores[0] ?? null;
  },

  // ── M4 이주/바우처 ──
  async listPrograms(): Promise<RelocationProgram[]> {
    return load<RelocationProgram[]>(K.programs, demoRelocationPrograms).filter((p) => p.active);
  },
  async createProgram(input: Omit<RelocationProgram, "id" | "active">): Promise<RelocationProgram> {
    const all = load<RelocationProgram[]>(K.programs, demoRelocationPrograms);
    const p: RelocationProgram = { ...input, id: rid("rp"), active: true };
    save(K.programs, [p, ...all]);
    return p;
  },
  async listRelocApps(filter?: { uid?: string }): Promise<RelocationApp[]> {
    const all = load<RelocationApp[]>(K.relocApps, demoRelocationApps);
    return filter?.uid ? all.filter((a) => a.uid === filter.uid) : all;
  },
  async applyReloc(input: { uid: string; applicantName: string; programId: string; programTitle: string; housingOpt?: string; transportOpt?: string }): Promise<RelocationApp> {
    const all = load<RelocationApp[]>(K.relocApps, demoRelocationApps);
    const a: RelocationApp = { ...input, id: rid("ra"), status: "applied", createdAt: nowIso() };
    save(K.relocApps, [a, ...all]);
    return a;
  },
  async approveReloc(id: string): Promise<void> {
    const all = load<RelocationApp[]>(K.relocApps, demoRelocationApps);
    const idx = all.findIndex((a) => a.id === id);
    if (idx >= 0) { all[idx] = { ...all[idx], status: "approved" }; save(K.relocApps, all); }
  },
  async listVouchers(uid?: string): Promise<Voucher[]> {
    const all = load<Voucher[]>(K.vouchers, demoVouchers);
    return uid ? all.filter((v) => v.uid === uid) : all;
  },
  // 바우처 발급 — 플랫폼은 자금 미보관, 발급·사용 기록만 (부정유통 추적 메타)
  async issueVoucher(input: { uid: string; programId: string; amount: number; kind?: string }): Promise<Voucher> {
    const all = load<Voucher[]>(K.vouchers, demoVouchers);
    const v: Voucher = {
      id: rid("vc"), uid: input.uid, programId: input.programId, kind: input.kind ?? "온누리상품권",
      amount: input.amount, balance: input.amount, status: "issued",
      issuedAt: nowIso(), expiresAt: "2027-12-31T23:59:59Z",
    };
    save(K.vouchers, [v, ...all]);
    return v;
  },

  // ── M5 커머스 ──
  async getShop(uid: string): Promise<Shop | null> {
    return demoShops.find((s) => s.uid === uid) ?? null;
  },
  async listProducts(shopId: string): Promise<Product[]> {
    return load<Product[]>(K.products, demoProducts).filter((p) => p.shopId === shopId);
  },
  async addProduct(input: { shopId: string; kind: Product["kind"]; title: string; price: number }): Promise<Product> {
    const all = load<Product[]>(K.products, demoProducts);
    // 식품(food)은 영업신고 검증 전까지 비활성 (검증 게이트)
    const p: Product = {
      ...input, id: rid("pr"), verified: false,
      active: input.kind !== "food", createdAt: nowIso(),
    };
    save(K.products, [p, ...all]);
    return p;
  },
  // 영업신고/통신판매 검증 통과 → 식품 판매 활성화
  async verifyProduct(id: string): Promise<void> {
    const all = load<Product[]>(K.products, demoProducts);
    const idx = all.findIndex((p) => p.id === id);
    if (idx >= 0) { all[idx] = { ...all[idx], verified: true, active: true }; save(K.products, all); }
  },

  // ── M6 마케팅 ──
  async socialAccounts(uid: string): Promise<SocialAccount[]> {
    return demoSocialAccounts.filter((a) => a.uid === uid);
  },
  async listPosts(uid: string): Promise<SocialPost[]> {
    return load<SocialPost[]>(K.posts, demoSocialPosts).filter((p) => p.uid === uid);
  },
  async schedulePost(input: { uid: string; platforms: SocialPost["platforms"]; caption: string; mediaName: string; scheduledAt: string }): Promise<SocialPost> {
    const all = load<SocialPost[]>(K.posts, demoSocialPosts);
    const p: SocialPost = { ...input, id: rid("sp"), status: "queued", adDisclosure: true, createdAt: nowIso() };
    save(K.posts, [p, ...all]);
    return p;
  },

  // ── M7 거점 ──
  async listVenues(): Promise<OfflineVenue[]> {
    return load<OfflineVenue[]>(K.venues, demoVenues);
  },
  async createVenue(input: Omit<OfflineVenue, "id" | "createdAt" | "status"> & { status?: OfflineVenue["status"] }): Promise<OfflineVenue> {
    const all = load<OfflineVenue[]>(K.venues, demoVenues);
    const v: OfflineVenue = { ...input, status: input.status ?? "active", id: rid("ve"), createdAt: nowIso() };
    save(K.venues, [v, ...all]);
    return v;
  },

  // ── M8 글로벌 ──
  async listGlobalCandidates(): Promise<GlobalWorkerProfile[]> {
    return load<GlobalWorkerProfile[]>(K.global, demoGlobalProfiles);
  },
  async getGlobalProfile(uid: string): Promise<GlobalWorkerProfile | null> {
    const all = load<GlobalWorkerProfile[]>(K.global, demoGlobalProfiles);
    return all.find((g) => g.uid === uid) ?? all[0] ?? null;
  },
  async saveGlobalProfile(p: GlobalWorkerProfile): Promise<GlobalWorkerProfile> {
    const all = load<GlobalWorkerProfile[]>(K.global, demoGlobalProfiles);
    const idx = all.findIndex((g) => g.uid === p.uid);
    if (idx >= 0) all[idx] = p; else all.push(p);
    save(K.global, all);
    return p;
  },
};

export type Phase2Db = typeof phase2db;

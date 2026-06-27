// Phase 2 순수 계산 엔진 — M3 점수/등급/단가, M9 추천. (서버리스 데모: 클라에서 계산)
import type { TrustGrade, TrustScore, RecommendCard, SkillProfile } from "@/types/phase2";
import type { LatLng } from "@/types";
import { haversineM } from "@/lib/geo";
import { allCategories } from "./catalog";

// ── M3 점수 엔진 (베이지안 평활) ────────────────────────────
const PRIOR_MEAN = 3.5; // 전체 평균 사전값
const PRIOR_WEIGHT = 5; // 사전 표본 가중
const W = { trust: 0.4, kindness: 0.3, again: 0.3 }; // 종합 가중치(ADMIN 외부화 가능)

function smooth(value: number, n: number): number {
  return (value * n + PRIOR_MEAN * PRIOR_WEIGHT) / (n + PRIOR_WEIGHT);
}

export function gradeOf(composite: number): TrustGrade {
  if (composite < 2.5) return "새싹";
  if (composite < 3.5) return "일반";
  if (composite < 4.3) return "우수";
  return "마스터";
}

export const RATE_MULTIPLIER: Record<TrustGrade, number> = {
  새싹: 1.0,
  일반: 1.05,
  우수: 1.12,
  마스터: 1.2,
};

// 원천 지표(평가 평균)와 표본 수로 종합점수·등급·단가배수 산출
export function computeTrustScore(input: {
  uid: string;
  name: string;
  trust: number;
  kindness: number;
  again: number;
  sampleCount: number;
}): TrustScore {
  const n = input.sampleCount;
  const t = smooth(input.trust, n);
  const k = smooth(input.kindness, n);
  const a = smooth(input.again, n);
  const composite = +(W.trust * t + W.kindness * k + W.again * a).toFixed(2);
  const grade = gradeOf(composite);
  return {
    uid: input.uid,
    name: input.name,
    trust: +t.toFixed(2),
    kindness: +k.toFixed(2),
    again: +a.toFixed(2),
    composite,
    grade,
    rateMultiplier: RATE_MULTIPLIER[grade],
    sampleCount: n,
    updatedAt: new Date().toISOString(),
  };
}

// ── M9 위치기반 추천 ────────────────────────────────────────
// 입력: 현 위치, 내 스킬(강점/희망), (간단화된) 지역 수요·코스 후보.
export interface DemandJob {
  categoryId: string;
  title: string;
  geo: LatLng;
  basePay: number;
  demand: "high" | "medium" | "low";
}
export interface CourseLite {
  id: string;
  categoryId: string;
  title: string;
  geo?: LatLng;
  demand: "high" | "medium" | "low";
  expectedPay: number; // 수료 후 기대 단가
}

function catName(id: string) {
  return allCategories.find((c) => c.id === id)?.name ?? id;
}

export function recommend(input: {
  origin: LatLng;
  skills: SkillProfile[];
  jobs: DemandJob[];
  courses: CourseLite[];
  radiusM?: number;
}): RecommendCard[] {
  const { origin, skills, jobs, courses, radiusM = 50000 } = input;
  const strengthCats = new Set(skills.filter((s) => s.kind === "strength").map((s) => s.categoryId));
  const aspirationCats = new Set(skills.filter((s) => s.kind === "aspiration").map((s) => s.categoryId));

  const cards: RecommendCard[] = [];

  // ① 지금 할 일: 내 강점 ∩ 지역 수요(반경 내)
  for (const j of jobs) {
    const d = haversineM(origin, j.geo);
    if (d > radiusM) continue;
    if (!strengthCats.has(j.categoryId)) continue;
    cards.push({
      type: "job",
      title: j.title,
      subtitle: `${catName(j.categoryId)} · 근처에서 바로`,
      distanceM: Math.round(d),
      expectedPay: j.basePay,
      demandLevel: j.demand,
      href: "/partner",
      categoryId: j.categoryId,
    });
  }

  // ② 배울 것: 내 희망분야 ∩ 인근 코스 (수요·단가 높은 순)
  for (const c of courses) {
    if (!aspirationCats.has(c.categoryId)) continue;
    const d = c.geo ? Math.round(haversineM(origin, c.geo)) : undefined;
    cards.push({
      type: "course",
      title: c.title,
      subtitle: `${catName(c.categoryId)} 배우면 더 벌 수 있어요`,
      distanceM: d,
      expectedPay: c.expectedPay,
      demandLevel: c.demand,
      href: `/camp/${c.id}`,
      categoryId: c.categoryId,
    });
  }

  // ③ 벌 수 있는 것: 내 강점 분야의 근처 평균 수익 요약 카드
  const earnByCat = new Map<string, { pay: number; n: number; demand: DemandJob["demand"] }>();
  for (const j of jobs) {
    if (!strengthCats.has(j.categoryId)) continue;
    if (haversineM(origin, j.geo) > radiusM) continue;
    const cur = earnByCat.get(j.categoryId) ?? { pay: 0, n: 0, demand: j.demand };
    cur.pay += j.basePay;
    cur.n += 1;
    earnByCat.set(j.categoryId, cur);
  }
  for (const [cat, v] of earnByCat) {
    const avg = Math.round(v.pay / v.n / 1000) * 1000;
    cards.push({
      type: "earning",
      title: `근처에서 ${catName(cat)}로 일당 약 ${avg.toLocaleString("ko-KR")}원`,
      subtitle: `반경 ${Math.round(radiusM / 1000)}km · 수요 ${v.n}건`,
      expectedPay: Math.round(v.pay / v.n),
      demandLevel: v.demand,
      href: "/me/recommend",
      categoryId: cat,
    });
  }

  // 정렬: 수요 높은 → 거리 가까운
  const dRank = { high: 0, medium: 1, low: 2 };
  return cards.sort((a, b) => {
    if (dRank[a.demandLevel] !== dRank[b.demandLevel]) return dRank[a.demandLevel] - dRank[b.demandLevel];
    return (a.distanceM ?? 1e9) - (b.distanceM ?? 1e9);
  });
}

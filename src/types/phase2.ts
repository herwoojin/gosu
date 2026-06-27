// Phase 2 도메인 타입 — erd-phase2.md 기반. mock(localStorage) 데모용 클라 모델.
// Phase 1 타입(LatLng, Category 등)은 ./index 에서 재사용.

import type { LatLng } from "./index";

// ── M1. 스킬/희망분야 ───────────────────────────────────────
export type SkillKind = "strength" | "aspiration"; // 잘하는 / 잘하고 싶은
export interface SkillProfile {
  id: string;
  uid: string;
  categoryId: string;
  kind: SkillKind;
  level: number; // 1~5 숙련도 (strength일 때 의미)
  note?: string;
  createdAt: string;
}

// N잡러 활동 분야별 수익 요약
export interface FieldEarning {
  categoryId: string;
  jobs: number; // 완료 일감 수
  revenue: number; // 누적 수익(원)
  rating: number; // 분야 평점
}

// ── M2. 코스/기수/수강 ──────────────────────────────────────
export type CourseMode = "online" | "offline" | "hybrid";
export type CourseStatus = "draft" | "open" | "closed";
export interface Course {
  id: string;
  mentorUid: string;
  mentorName: string;
  categoryId: string;
  title: string;
  summary: string;
  mode: CourseMode;
  price: number;
  certType: string; // 수료증/민간자격(등록 전제). 국가자격 오인 금지 문구 노출
  status: CourseStatus;
  lessons: string[]; // 커리큘럼 단계
  venueId?: string; // 오프라인 거점(M7)
  createdAt: string;
}
export type CohortStatus = "recruiting" | "in_progress" | "done";
export interface Cohort {
  id: string;
  courseId: string;
  venueId?: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolled: number;
  status: CohortStatus;
}
export type EnrollStatus = "enrolled" | "in_progress" | "completed" | "dropped";
export interface Enrollment {
  id: string;
  cohortId: string;
  courseId: string;
  uid: string;
  status: EnrollStatus;
  progress: number; // 0~100
  completedAt?: string;
  certUrl?: string;
  createdAt: string;
}

// ── M3. 신뢰/친절/다시만나요 점수 + 등급 ────────────────────
export type TrustGrade = "새싹" | "일반" | "우수" | "마스터";
export interface TrustScore {
  uid: string;
  name: string;
  trust: number; // 신뢰도 0~5
  kindness: number; // 친절도 0~5
  again: number; // 다시만나요 0~5
  composite: number;
  grade: TrustGrade;
  rateMultiplier: number; // 권장 단가 배수
  sampleCount: number;
  updatedAt: string;
}

// ── M4. 지자체/이주/바우처 ──────────────────────────────────
export interface RelocationBenefits {
  housing?: string; // 주거 지원 설명
  ktx?: boolean;
  flight?: boolean;
  car?: boolean;
  voucherAmount?: number; // 온누리상품권 등 발급 예정액
}
export interface RelocationProgram {
  id: string;
  lguId: string;
  orgName: string;
  regionName: string;
  regionCode: string;
  geo: LatLng;
  title: string;
  benefits: RelocationBenefits;
  targetJobs: string[];
  periodStart: string;
  periodEnd: string;
  active: boolean;
}
export type RelocStatus = "applied" | "approved" | "rejected" | "settled";
export interface RelocationApp {
  id: string;
  programId: string;
  programTitle: string;
  uid: string;
  applicantName: string;
  status: RelocStatus;
  housingOpt?: string;
  transportOpt?: string;
  createdAt: string;
}
export type VoucherStatus = "issued" | "used" | "partially_used" | "expired" | "revoked";
export interface Voucher {
  id: string;
  programId: string;
  uid: string;
  kind: string; // 온누리상품권 등
  amount: number;
  balance: number;
  status: VoucherStatus;
  issuedAt: string;
  expiresAt: string;
}

// ── M5. 1인 커머스 ──────────────────────────────────────────
export type ProductKind = "service" | "goods" | "food";
export interface Shop {
  id: string;
  uid: string;
  brandName: string;
  intro: string;
  venueId?: string;
  createdAt: string;
}
export interface Product {
  id: string;
  shopId: string;
  kind: ProductKind;
  title: string;
  price: number;
  active: boolean; // food는 영업신고 검증 후에만 true
  verified: boolean; // 영업신고/통신판매 검증 여부
  createdAt: string;
}

// ── M6. SNS 연동/게시 ───────────────────────────────────────
export type SocialPlatform = "instagram" | "youtube";
export type PostStatus = "queued" | "published" | "failed" | "rejected";
export interface SocialAccount {
  uid: string;
  platform: SocialPlatform;
  connected: boolean;
  handle?: string;
}
export interface SocialPost {
  id: string;
  uid: string;
  platforms: SocialPlatform[];
  caption: string;
  mediaName: string;
  scheduledAt: string;
  status: PostStatus;
  adDisclosure: boolean; // 뒷광고 표시 자동 삽입
  createdAt: string;
}

// ── M7. 오프라인 거점 ───────────────────────────────────────
export interface OfflineVenue {
  id: string;
  ownerUid: string;
  name: string;
  address: string;
  geo: LatLng;
  capacity: number;
  facilities: string[];
  status: "active" | "paused";
  createdAt: string;
}

// ── M8. 글로벌 워커 ─────────────────────────────────────────
export interface GlobalWorkerProfile {
  id: string;
  uid: string;
  nationality: string;
  languages: Record<string, number>; // {ko:3, en:5}
  visaType: string; // E-9/E-7/H-2/F계열 (확인용)
  visaStatus: string; // 체크리스트 결과
  desiredRegions: string[];
  desiredJobs: string[];
  verified: boolean;
  createdAt: string;
}

// ── M9. 위치기반 추천 카드 ──────────────────────────────────
export type RecommendType = "job" | "course" | "earning";
export interface RecommendCard {
  type: RecommendType;
  title: string;
  subtitle: string;
  distanceM?: number;
  expectedPay?: number;
  demandLevel: "high" | "medium" | "low";
  href: string;
  categoryId?: string;
}

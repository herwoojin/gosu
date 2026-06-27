// Phase 2 데모 시드 — mock(localStorage)의 초기값. 강남권 좌표 기준.
import type { Category } from "@/types";
import type {
  SkillProfile,
  Course,
  Cohort,
  Enrollment,
  TrustScore,
  RelocationProgram,
  Voucher,
  RelocationApp,
  Shop,
  Product,
  SocialPost,
  SocialAccount,
  OfflineVenue,
  GlobalWorkerProfile,
  FieldEarning,
} from "@/types/phase2";

// Phase 1 공종 외에 "재능·생활" 분야 추가 (N잡러 디스커버리용)
export const talentCategories: Category[] = [
  { id: "t-woodwork", code: "WOODWORK", name: "목공·DIY", icon: "Hammer" },
  { id: "t-electric", code: "ELECTRIC", name: "전기", icon: "Zap" },
  { id: "t-cook", code: "COOK", name: "요리·반찬", icon: "ChefHat" },
  { id: "t-barista", code: "BARISTA", name: "바리스타", icon: "Coffee" },
  { id: "t-video", code: "VIDEO", name: "영상편집", icon: "Video" },
  { id: "t-care", code: "CARE", name: "돌봄·간병", icon: "HeartHandshake" },
  { id: "t-farm", code: "FARM", name: "농작업", icon: "Sprout" },
  { id: "t-clean", code: "CLEAN", name: "청소·정리", icon: "Sparkles" },
];

const now = "2026-06-26T09:00:00Z";

export const demoSkills: SkillProfile[] = [
  { id: "sk-1", uid: "demo-partner", categoryId: "t-woodwork", kind: "strength", level: 5, note: "30년 목공 경력", createdAt: now },
  { id: "sk-2", uid: "demo-partner", categoryId: "c-hvac-repair", kind: "strength", level: 4, createdAt: now },
  { id: "sk-3", uid: "demo-partner", categoryId: "t-electric", kind: "aspiration", level: 0, note: "전기 자격 따고 싶어요", createdAt: now },
  { id: "sk-4", uid: "demo-partner", categoryId: "t-video", kind: "aspiration", level: 0, createdAt: now },
];

export const demoFieldEarnings: FieldEarning[] = [
  { categoryId: "t-woodwork", jobs: 42, revenue: 8400000, rating: 4.8 },
  { categoryId: "c-hvac-repair", jobs: 18, revenue: 2160000, rating: 4.6 },
];

export const demoCourses: Course[] = [
  {
    id: "co-1", mentorUid: "demo-mentor", mentorName: "박목수 마스터", categoryId: "t-woodwork",
    title: "주말 목공 입문 — 나만의 가구 만들기", summary: "공구 안전부터 원목 소품·선반 제작까지 4주 과정.",
    mode: "hybrid", price: 180000, certType: "수료증(민간)", status: "open",
    lessons: ["공구·안전 기초", "재단·결합", "사포·마감", "작품 제작·발표"], venueId: "ve-1", createdAt: now,
  },
  {
    id: "co-2", mentorUid: "demo-mentor", mentorName: "김전기 기사", categoryId: "t-electric",
    title: "생활 전기 기초 + 전기기능사 대비", summary: "콘센트·조명 교체 실습과 자격증 필기 핵심.",
    mode: "online", price: 120000, certType: "수료증(민간)", status: "open",
    lessons: ["전기 안전", "배선 기초", "조명·스위치 교체", "자격 대비"], createdAt: now,
  },
  {
    id: "co-3", mentorUid: "demo-mentor2", mentorName: "이세프", categoryId: "t-cook",
    title: "반찬가게 창업 — 위생·원가·맛", summary: "영업신고·공유주방 활용까지 실전 창업 4주.",
    mode: "offline", price: 250000, certType: "수료증(민간)", status: "open",
    lessons: ["식품위생·영업신고", "대량조리 원가", "포장·유통", "온라인 판매"], venueId: "ve-1", createdAt: now,
  },
  {
    id: "co-4", mentorUid: "demo-mentor2", mentorName: "최편집", categoryId: "t-video",
    title: "스마트폰 하나로 시작하는 영상편집", summary: "촬영·컷편집·자막·썸네일까지. SNS 홍보 연계.",
    mode: "online", price: 90000, certType: "수료증(민간)", status: "open",
    lessons: ["촬영 기초", "컷편집", "자막·음악", "업로드·홍보"], createdAt: now,
  },
];

export const demoCohorts: Cohort[] = [
  { id: "ch-1", courseId: "co-1", venueId: "ve-1", startDate: "2026-07-05", endDate: "2026-07-26", capacity: 12, enrolled: 7, status: "recruiting" },
  { id: "ch-2", courseId: "co-2", startDate: "2026-07-01", endDate: "2026-07-22", capacity: 30, enrolled: 19, status: "recruiting" },
  { id: "ch-3", courseId: "co-3", venueId: "ve-1", startDate: "2026-07-10", endDate: "2026-08-07", capacity: 10, enrolled: 10, status: "recruiting" },
  { id: "ch-4", courseId: "co-4", startDate: "2026-07-03", endDate: "2026-07-24", capacity: 50, enrolled: 12, status: "recruiting" },
];

export const demoEnrollments: Enrollment[] = [
  { id: "en-1", cohortId: "ch-2", courseId: "co-2", uid: "demo-partner", status: "in_progress", progress: 50, createdAt: now },
];

// 신뢰/친절/다시만나요 점수 데모 (협력사들)
export const demoTrustScores: TrustScore[] = [
  { uid: "demo-partner", name: "이고수 (협력사)", trust: 4.7, kindness: 4.9, again: 4.6, composite: 4.73, grade: "마스터", rateMultiplier: 1.2, sampleCount: 132, updatedAt: now },
  { uid: "demo-partner-2", name: "(주)클린에어 서비스", trust: 4.4, kindness: 4.2, again: 4.1, composite: 4.25, grade: "우수", rateMultiplier: 1.12, sampleCount: 89, updatedAt: now },
  { uid: "demo-partner-3", name: "김설비 (숙련공)", trust: 3.9, kindness: 4.3, again: 3.7, composite: 3.97, grade: "우수", rateMultiplier: 1.12, sampleCount: 21, updatedAt: now },
];

export const demoVenues: OfflineVenue[] = [
  {
    id: "ve-1", ownerUid: "demo-owner", name: "우리동네고수 강남 거점", address: "서울 강남구 테헤란로 152",
    geo: { lat: 37.5006, lng: 127.0366 }, capacity: 24, facilities: ["공유주방", "공구실", "세미나실", "픽업대"], status: "active", createdAt: now,
  },
  {
    id: "ve-2", ownerUid: "demo-owner2", name: "성수 메이커 스페이스", address: "서울 성동구 아차산로 100",
    geo: { lat: 37.5446, lng: 127.0560 }, capacity: 16, facilities: ["목공실", "촬영스튜디오"], status: "active", createdAt: now,
  },
];

export const demoRelocationPrograms: RelocationProgram[] = [
  {
    id: "rp-1", lguId: "lgu-1", orgName: "전남 강진군", regionName: "전남 강진", regionCode: "46810",
    geo: { lat: 34.6420, lng: 126.7672 }, title: "강진 살아보기 — 목공·농작업 N잡 정착",
    benefits: { housing: "셰어하우스 3개월 무상", ktx: true, car: true, voucherAmount: 500000 },
    targetJobs: ["목공·DIY", "농작업", "청소·정리"], periodStart: "2026-07-01", periodEnd: "2026-12-31", active: true,
  },
  {
    id: "rp-2", lguId: "lgu-2", orgName: "경북 의성군", regionName: "경북 의성", regionCode: "47730",
    geo: { lat: 36.3526, lng: 128.6970 }, title: "의성 청년·시니어 정착 패키지",
    benefits: { housing: "임시거처 제공", ktx: true, flight: false, voucherAmount: 300000 },
    targetJobs: ["농작업", "돌봄·간병", "요리·반찬"], periodStart: "2026-08-01", periodEnd: "2027-02-28", active: true,
  },
];

export const demoRelocationApps: RelocationApp[] = [];
export const demoVouchers: Voucher[] = [];

export const demoShops: Shop[] = [
  { id: "shp-1", uid: "demo-partner", brandName: "이고수의 원목공방", intro: "주문 제작 원목 소품·가구", createdAt: now },
];
export const demoProducts: Product[] = [
  { id: "pr-1", shopId: "shp-1", kind: "goods", title: "원목 도마(중)", price: 28000, active: true, verified: true, createdAt: now },
  { id: "pr-2", shopId: "shp-1", kind: "service", title: "맞춤 선반 시공", price: 150000, active: true, verified: true, createdAt: now },
  { id: "pr-3", shopId: "shp-1", kind: "food", title: "수제 반찬 세트", price: 19000, active: false, verified: false, createdAt: now },
];

export const demoSocialAccounts: SocialAccount[] = [
  { uid: "demo-partner", platform: "instagram", connected: true, handle: "@gosu_woodwork" },
  { uid: "demo-partner", platform: "youtube", connected: false },
];
export const demoSocialPosts: SocialPost[] = [
  {
    id: "sp-1", uid: "demo-partner", platforms: ["instagram"], caption: "오늘 만든 원목 선반 🌿 주문제작 문의 환영!",
    mediaName: "shelf.mp4", scheduledAt: "2026-06-28T10:00:00Z", status: "queued", adDisclosure: true, createdAt: now,
  },
];

export const demoGlobalProfiles: GlobalWorkerProfile[] = [
  {
    id: "gw-1", uid: "demo-worker_global", nationality: "베트남", languages: { ko: 2, en: 3, vi: 5 },
    visaType: "E-9 (고용허가제)", visaStatus: "요건 안내 — EPS 한국어능력시험(EPS-TOPIK) 필요",
    desiredRegions: ["경북 의성", "전남 강진"], desiredJobs: ["농작업", "목공·DIY"], verified: true, createdAt: now,
  },
  {
    id: "gw-2", uid: "gw-uid-2", nationality: "필리핀", languages: { ko: 3, en: 5 },
    visaType: "E-7 (특정활동)", visaStatus: "요건 충족 — 고용계약·자격 확인 완료",
    desiredRegions: ["서울", "경기 성남"], desiredJobs: ["돌봄·간병", "청소·정리"], verified: true, createdAt: now,
  },
  {
    id: "gw-3", uid: "gw-uid-3", nationality: "우즈베키스탄", languages: { ko: 4, en: 2, uz: 5 },
    visaType: "H-2 (방문취업)", visaStatus: "요건 안내 — 건설업 기초안전보건교육 필요",
    desiredRegions: ["경기", "충북 청주"], desiredJobs: ["목공·DIY", "전기", "농작업"], verified: false, createdAt: now,
  },
  {
    id: "gw-4", uid: "gw-uid-4", nationality: "네팔", languages: { ko: 2, en: 4, ne: 5 },
    visaType: "E-9 (고용허가제)", visaStatus: "입국 전 — EPS 절차 진행 중",
    desiredRegions: ["전남 강진", "경북 의성"], desiredJobs: ["농작업", "요리·반찬"], verified: false, createdAt: now,
  },
];

// 전체 글로벌 워커 후보 (협력사/관리자가 사전 매칭용으로 조회)
export const demoGlobalCandidates = demoGlobalProfiles;

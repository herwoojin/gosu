import type {
  Bid,
  Category,
  PartnerProfile,
  QuoteRequest,
  RequestTemplate,
  AppNotification,
  Store,
  ConsultRequest,
} from "@/types";

// PRD §3.2 공종 시드
export const categories: Category[] = [
  { id: "c-hvac-repair", code: "HVAC_REPAIR", name: "냉난방기 수리", icon: "Wind", description: "에어컨·히터 고장 수리" },
  { id: "c-hvac-clean", code: "HVAC_CLEAN", name: "냉난방기 청소", icon: "Sparkles", description: "분해 세척·필터 관리" },
  { id: "c-demolition", code: "DEMOLITION", name: "철거·원상복구", icon: "Hammer", description: "인테리어 철거·복구" },
  { id: "c-waste", code: "WASTE", name: "폐기물 처리", icon: "Trash2", description: "산업·생활 폐기물 수거" },
  { id: "c-plumbing", code: "PLUMBING", name: "수도배관", icon: "Wrench", description: "급배수·배관 공사" },
  { id: "c-leak", code: "LEAK", name: "누수탐지", icon: "Droplets", description: "누수 위치 탐지·보수" },
  { id: "c-moving", code: "MOVING", name: "용달·이사", icon: "Truck", description: "소형 화물·점포 이전" },
  { id: "c-terrace", code: "TERRACE", name: "테라스(방부목)", icon: "TreePine", description: "방부목 시공·보수" },
];

// PRD §3.2 견적요청 마법사 — 공종별 3~5단계 JSON 스키마
const commonLocationStep = {
  step: 3,
  title: "매장·위치 정보",
  fields: [
    { key: "address", label: "점포 주소", type: "text", required: true, placeholder: "도로명 주소 검색" },
    { key: "storeType", label: "점포 유형", type: "select", options: ["편의점(GS25)", "편의점(CU)", "편의점(세븐일레븐)", "기타 점포"], required: true },
    { key: "area", label: "면적(㎡)", type: "number", placeholder: "예: 33" },
  ],
} as const;

const commonScheduleStep = {
  step: 4,
  title: "일정·긴급도",
  fields: [
    { key: "urgency", label: "긴급도", type: "select", options: ["지금 바로", "오늘 중", "이번 주", "협의 가능"], required: true },
    { key: "preferredTime", label: "선호 방문 시간", type: "text", placeholder: "예: 평일 오전" },
  ],
} as const;

const commonDetailStep = {
  step: 5,
  title: "상세 요청 + 사진",
  fields: [
    { key: "detail", label: "상세 요청 내용", type: "textarea", required: true, placeholder: "증상·요청사항을 자세히 적어주세요" },
    { key: "media", label: "사진/동영상 첨부", type: "media" },
  ],
} as const;

export const templates: Record<string, RequestTemplate> = {
  "c-hvac-repair": {
    categoryId: "c-hvac-repair",
    steps: [
      {
        step: 1,
        title: "공종 확인",
        fields: [{ key: "category", label: "선택한 공종", type: "text", required: true, placeholder: "냉난방기 수리" }],
      },
      {
        step: 2,
        title: "세부 서비스",
        fields: [
          { key: "service", label: "어떤 작업이 필요하세요?", type: "select", options: ["설치", "수리", "점검", "이전설치"], required: true },
          { key: "acType", label: "기기 종류", type: "select", options: ["벽걸이형", "스탠드형", "천장형(시스템)", "항온항습기"] },
          { key: "symptom", label: "증상", type: "select", options: ["냉방 안 됨", "난방 안 됨", "소음/진동", "누수", "전원 불량", "기타"] },
        ],
      },
      commonLocationStep as any,
      commonScheduleStep as any,
      commonDetailStep as any,
    ],
  },
  // 나머지 공종은 공통 4단계 골격 사용 (ADMIN이 request_templates로 편집)
};

export function getTemplate(categoryId: string): RequestTemplate {
  if (templates[categoryId]) return templates[categoryId];
  const cat = categories.find((c) => c.id === categoryId);
  return {
    categoryId,
    steps: [
      {
        step: 1,
        title: "세부 서비스",
        fields: [
          { key: "category", label: "선택한 공종", type: "text", required: true, placeholder: cat?.name ?? "" },
          { key: "service", label: "필요한 작업", type: "textarea", required: true, placeholder: "어떤 작업이 필요한지 적어주세요" },
        ],
      },
      { ...(commonLocationStep as any), step: 2 },
      { ...(commonScheduleStep as any), step: 3 },
      { ...(commonDetailStep as any), step: 4 },
    ],
  };
}

// 좌표는 서울 강남권 기준 데모값 (OSM 표시·거리 계산용)
export const demoPartners: PartnerProfile[] = [
  {
    id: "p-1", uid: "demo-partner-1", kind: "sole_proprietor", name: "한빛 냉난방설비",
    bizRegNo: "123-45-67890", bizVerified: true, baseAddress: "서울 강남구 역삼동",
    geo: { lat: 37.5006, lng: 127.0366 }, serviceRadiusM: 20000,
    categoryIds: ["c-hvac-repair", "c-hvac-clean"], sigunguCodes: ["11680"], status: "approved",
    rating: 4.8, sampleCount: 132, responsiveness: 0.92, phone: "010-1111-2222",
    consulting: { offersFreeAs: true, offersPaidVisit: true, visitFee: 30000, note: "전화 무료 진단 후 필요 시 출장 점검합니다." },
    createdAt: "2026-01-12T09:00:00Z",
  },
  {
    id: "p-2", uid: "demo-partner-2", kind: "corporation", name: "(주)클린에어 서비스",
    bizRegNo: "211-87-65432", bizVerified: true, baseAddress: "서울 서초구 서초동",
    geo: { lat: 37.4837, lng: 127.0324 }, serviceRadiusM: 30000,
    categoryIds: ["c-hvac-repair", "c-leak", "c-plumbing"], sigunguCodes: ["11650", "11680"], status: "approved",
    rating: 4.6, sampleCount: 89, responsiveness: 0.81, phone: "010-3333-4444",
    consulting: { offersFreeAs: false, offersPaidVisit: true, visitFee: 50000, note: "현장 출장 정밀진단(누수·배관) 전문." },
    createdAt: "2026-02-03T09:00:00Z",
  },
  {
    id: "p-3", uid: "demo-partner-3", kind: "individual", name: "김설비 (숙련공)",
    bizVerified: false, baseAddress: "서울 송파구 잠실동",
    geo: { lat: 37.5133, lng: 127.1000 }, serviceRadiusM: 15000,
    categoryIds: ["c-hvac-repair"], sigunguCodes: ["11710"], status: "approved",
    rating: 4.3, sampleCount: 21, responsiveness: 0.74, phone: "010-5555-6666",
    consulting: { offersFreeAs: true, offersPaidVisit: false, visitFee: 0, note: "사진 보내주시면 무료로 봐드립니다." },
    createdAt: "2026-03-15T09:00:00Z",
  },
  {
    id: "p-4", uid: "demo-partner-4", kind: "sole_proprietor", name: "동남 철거·원상복구",
    bizRegNo: "305-22-11111", bizVerified: true, baseAddress: "경기 성남시 분당구",
    geo: { lat: 37.3826, lng: 127.1190 }, serviceRadiusM: 40000,
    categoryIds: ["c-demolition", "c-waste"], sigunguCodes: ["41135"], status: "pending",
    rating: 0, sampleCount: 0, responsiveness: 0, phone: "010-7777-8888",
    consulting: { offersFreeAs: false, offersPaidVisit: true, visitFee: 40000 },
    createdAt: "2026-06-20T09:00:00Z",
  },
];

// 데모 점포 (경영주의 내 점포). 강남역 인근.
export const demoStore: Store = {
  id: "s-1",
  ownerUid: "demo-owner",
  name: "GS25 강남역점",
  storeType: "편의점(GS25)",
  address: "서울 강남구 강남대로 396",
  geo: { lat: 37.4979, lng: 127.0276 },
};

// 데모 컨설팅 요청 (메모리 mock 시드)
export const demoConsultRequests: ConsultRequest[] = [
  {
    id: "cr-1", storeId: "s-1", ownerUid: "demo-owner", partnerId: "p-1", partnerName: "한빛 냉난방설비",
    categoryId: "c-hvac-repair", mode: "free_as", fee: 0,
    message: "에어컨 냉방이 약한데 무료로 한번 봐주실 수 있나요?", status: "accepted",
    createdAt: "2026-06-24T09:00:00Z",
  },
];

export const demoRequests: QuoteRequest[] = [
  {
    id: "r-1", ownerUid: "demo-owner", categoryId: "c-hvac-repair",
    title: "스탠드 에어컨 냉방 불량 — 강남점", address: "서울 강남구 테헤란로 123", sigunguCode: "11680",
    urgency: "today", payMethod: "instant", status: "bidding",
    bidDeadline: "2026-06-26T18:00:00Z", createdAt: "2026-06-25T08:30:00Z",
    answers: { service: "수리", acType: "스탠드형", symptom: "냉방 안 됨", storeType: "편의점(GS25)", area: "33", detail: "어제부터 찬바람이 안 나옵니다. 영업 중이라 빠른 방문 부탁드립니다." },
    mediaUrls: [],
  },
  {
    id: "r-2", ownerUid: "demo-owner", categoryId: "c-leak",
    title: "창고 천장 누수 탐지 — 서초점", address: "서울 서초구 서초대로 77", sigunguCode: "11650",
    urgency: "this_week", payMethod: "hq", status: "open",
    bidDeadline: "2026-06-28T18:00:00Z", createdAt: "2026-06-24T11:00:00Z",
    answers: { service: "누수 위치 탐지 및 보수 견적", storeType: "편의점(CU)", detail: "비 오는 날 천장에서 물이 떨어집니다." },
    mediaUrls: [],
  },
];

export const demoBids: Bid[] = [
  {
    id: "b-1", requestId: "r-1", partnerId: "p-1", partnerName: "한빛 냉난방설비", partnerRating: 4.8,
    amount: 120000, message: "콤프레서 점검 후 가스 충전 포함 금액입니다. 오늘 오후 방문 가능합니다.",
    estSchedule: "오늘 14:00~", status: "submitted", createdAt: "2026-06-25T09:10:00Z",
  },
  {
    id: "b-2", requestId: "r-1", partnerId: "p-2", partnerName: "(주)클린에어 서비스", partnerRating: 4.6,
    amount: 98000, message: "기본 점검비 + 부품 별도. 내일 오전 방문 권장드립니다.",
    estSchedule: "내일 오전", status: "submitted", createdAt: "2026-06-25T09:40:00Z",
  },
  {
    id: "b-3", requestId: "r-1", partnerId: "p-3", partnerName: "김설비 (숙련공)", partnerRating: 4.3,
    amount: 85000, message: "출장비 포함 정직 견적입니다. 부품 필요 시 사전 협의드립니다.",
    estSchedule: "오늘 17:00~", status: "submitted", createdAt: "2026-06-25T10:05:00Z",
  },
];

export const demoNotifications: AppNotification[] = [
  { id: "n-1", type: "bid", title: "새 입찰이 도착했습니다", body: "강남점 에어컨 수리 건에 3건 입찰", createdAt: "2026-06-25T10:05:00Z", read: false },
  { id: "n-2", type: "match", title: "내 공종에 맞는 일감", body: "서초점 누수탐지 건이 매칭되었습니다", createdAt: "2026-06-24T11:05:00Z", read: false },
  { id: "n-3", type: "award", title: "낙찰을 축하합니다", body: "지난 철거 건이 낙찰되었습니다", createdAt: "2026-06-22T15:20:00Z", read: true },
];

export function categoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

// ERD(erd.md) 기반 도메인 타입. RLS/PostGIS는 백엔드, 여기선 클라 모델만.

export type Role = "OWNER" | "PARTNER" | "ADMIN" | "SUPER_ADMIN";

export type RequestStatus =
  | "draft"
  | "open"
  | "bidding"
  | "awarded"
  | "in_progress"
  | "completed"
  | "canceled"
  | "expired";

export type PayMethod = "instant" | "hq";
export type Urgency = "now" | "today" | "this_week" | "flexible";
export type PartnerKind = "corporation" | "sole_proprietor" | "individual";
export type PartnerStatus = "pending" | "approved" | "rejected" | "suspended";
export type BidStatus = "submitted" | "withdrawn" | "awarded" | "rejected" | "expired";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  roles: Role[];
  activeRole: Role;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  icon: string; // lucide icon name
  description?: string;
}

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "media";
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface TemplateStep {
  step: number;
  title: string;
  fields: TemplateField[];
}

export interface RequestTemplate {
  categoryId: string;
  steps: TemplateStep[];
}

export interface QuoteRequest {
  id: string;
  ownerUid: string;
  categoryId: string;
  title: string;
  address: string;
  sigunguCode: string;
  urgency: Urgency;
  payMethod: PayMethod;
  status: RequestStatus;
  bidDeadline: string;
  createdAt: string;
  answers: Record<string, string>;
  mediaUrls: string[];
}

export interface LatLng {
  lat: number;
  lng: number;
}

// 컨설팅 제공 옵션 (협력사가 설정, 경영주가 요청 시 선택)
export interface ConsultingOptions {
  offersFreeAs: boolean; // 무료 AS(원격/전화/방문) 컨설팅 제공
  offersPaidVisit: boolean; // 유료 출장 컨설팅 제공
  visitFee: number; // 유료 출장 기본 비용(원). offersPaidVisit=false면 무시
  note?: string; // 컨설팅 안내 문구
}

export interface PartnerProfile {
  id: string;
  uid: string;
  kind: PartnerKind;
  name: string;
  bizRegNo?: string;
  bizVerified: boolean;
  baseAddress: string;
  geo: LatLng; // OSM 표시·거리 계산용 좌표
  serviceRadiusM: number;
  categoryIds: string[];
  sigunguCodes: string[];
  status: PartnerStatus;
  rejectedReason?: string;
  rating: number; // 0~5 공개 종합점수
  sampleCount: number;
  responsiveness: number; // 0~1
  phone: string;
  consulting: ConsultingOptions;
  createdAt: string;
}

// 내 점포 (경영주가 등록, OSM 좌표 보유)
export interface Store {
  id: string;
  ownerUid: string;
  name: string;
  storeType: string;
  address: string;
  geo: LatLng;
}

export type ConsultMode = "free_as" | "paid_visit";
export type ConsultStatus = "requested" | "accepted" | "scheduled" | "completed" | "declined";

export interface ConsultRequest {
  id: string;
  storeId: string;
  ownerUid: string;
  partnerId: string;
  partnerName: string;
  categoryId?: string;
  mode: ConsultMode;
  fee: number; // free_as면 0
  message: string;
  preferredTime?: string;
  status: ConsultStatus;
  createdAt: string;
}

export interface Bid {
  id: string;
  requestId: string;
  partnerId: string;
  partnerName: string;
  partnerRating: number;
  amount: number;
  message: string;
  estSchedule: string;
  status: BidStatus;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: "match" | "bid" | "award" | "settle" | "rating";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

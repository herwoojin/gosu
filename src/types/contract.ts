// 협력사 등록 + 3자(경영주·본부담당자·협력사) 계약/서명 도메인 타입 (mock 데모)

export type PartnerKind = "corporation" | "sole_proprietor" | "individual";

export interface CareerEntry {
  id: string;
  field: string; // 업종/공종
  years: number; // 경력 연차
  description: string; // 주요 경력 설명
}

// 협력사 최초 1회 등록 정보
export interface PartnerRegistration {
  uid: string;
  kind: PartnerKind;
  companyName: string;
  ownerName: string;
  phone: string;
  bizRegNo: string; // 사업자등록번호
  bizVerified: boolean; // 국세청 진위확인 결과(데모)
  bizRegFileName: string; // 사업자등록증 파일명(업로드 데모)
  baseAddress: string;
  categoryIds: string[]; // 업종(공종, 복수)
  careers: CareerEntry[]; // 경력
  registeredAt: string;
}

// ── 3자 계약 ───────────────────────────────────────────────
export type ContractParty = "owner" | "admin" | "partner";

export type ClauseStatus = "proposed" | "accepted" | "revision_requested";

// 특약 (경영주/본부담당자가 제안 → 협력사가 수용/수정요청)
export interface SpecialClause {
  id: string;
  party: "owner" | "admin"; // 제안 주체
  text: string;
  status: ClauseStatus;
  revisionNote?: string; // 협력사 수정요청 사유
}

export interface Signature {
  party: ContractParty;
  name: string; // 정자체 본인 이름 (디지털 서명)
  signedAt: string;
}

export type ContractStatus =
  | "drafting" // 경영주/본부 특약 작성 중
  | "partner_review" // 협력사 검토(수용/수정요청)
  | "revision_requested" // 협력사 수정요청 → 경영주/본부 재작성
  | "signing" // 최종 승인 → 3자 서명 단계
  | "signed" // 서명 완료(계약 체결)
  | "canceled";

export interface Contract {
  id: string;
  requestId: string;
  requestTitle: string;
  categoryName: string;
  amount: number;
  ownerUid: string;
  ownerName: string;
  adminName: string; // 본부담당자
  partnerId: string; // 협력사 식별(p-1 등 또는 uid)
  partnerUid: string;
  partnerName: string;
  baseTerms: string[]; // 기본 계약서 양식 조항
  clauses: SpecialClause[]; // 특약
  signatures: Signature[];
  status: ContractStatus;
  createdAt: string;
}

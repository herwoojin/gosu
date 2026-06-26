import type {
  PartnerProfile,
  Store,
  ConsultRequest,
  ConsultMode,
  ConsultStatus,
  ConsultingOptions,
  LatLng,
} from "@/types";

// 데이터 접근 추상화. 현재는 mock(localStorage), 나중에 Firebase(Firestore/Storage) 구현으로 교체.
// 모든 메서드는 async — Firestore 전환 시 시그니처 변경 없이 구현만 바꾼다.
export interface NearbyPartner {
  partner: PartnerProfile;
  distanceM: number;
}

export interface DataProvider {
  // 점포
  getStore(ownerUid: string): Promise<Store | null>;
  saveStore(store: Store): Promise<Store>;

  // 협력사
  listPartners(): Promise<PartnerProfile[]>;
  getPartner(id: string): Promise<PartnerProfile | null>;
  savePartnerConsulting(partnerId: string, opts: ConsultingOptions): Promise<void>;
  // 내 점포 기준 가까운 승인 협력사 (옵션: 공종 필터, 무료/유료 컨설팅 필터)
  getNearbyPartners(
    origin: LatLng,
    opts?: { categoryId?: string; mode?: ConsultMode; limit?: number }
  ): Promise<NearbyPartner[]>;

  // 컨설팅 요청 (웹훅 emit 포함)
  listConsultRequests(filter: { ownerUid?: string; partnerId?: string }): Promise<ConsultRequest[]>;
  createConsultRequest(
    input: Omit<ConsultRequest, "id" | "status" | "createdAt">
  ): Promise<ConsultRequest>;
  updateConsultStatus(id: string, status: ConsultStatus): Promise<void>;
}

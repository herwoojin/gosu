"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui";

const SECTIONS = [
  { title: "통신판매중개자 고지", body: "우리동네고수는 통신판매중개자로서 거래 당사자가 아니며, 요청자와 협력사 간 거래·서비스의 책임은 거래 당사자에게 있습니다. 협력사의 자격·이행에 대한 최종 확인 책임은 이용자에게 있습니다." },
  { title: "협력사 등록 동의(진위확인)", body: "입력하신 사업자등록번호는 국세청 사업자등록정보 진위확인 서비스를 통해 검증됩니다. 허위 정보 등록 시 이용이 제한될 수 있습니다." },
  { title: "무사업자 참여·원천징수 안내", body: "사업자등록이 없는 개인으로 용역을 제공하는 경우, 지급액에 대해 관련 세법에 따른 원천징수(예: 사업소득 3.3%)가 적용될 수 있으며, 지급명세서가 작성될 수 있습니다." },
  { title: "결제 구조 고지", body: "즉시결제는 라이선스 결제대행사를 통해 처리되며, 본부결제는 본부가 협력사에 직접 지급하는 방식입니다. 우리동네고수는 거래 대금을 직접 보관·중계하지 않습니다." },
  { title: "위치·민감정보", body: "점포/서비스 지역 매칭을 위해 위치정보를 수집·이용하며, 원천징수 등 법령상 필요한 경우에 한해 고유식별정보를 수집할 수 있습니다." },
  { title: "후기·평점 운영원칙", body: "후기는 실제 이용 기반으로 작성되어야 하며, 허위·조작 후기는 제한됩니다. 협력사는 부당한 평가에 대해 이의신청·정정을 요청할 수 있습니다." },
  { title: "단가·표준인건비 참고 고지", body: "제공되는 단가·표준인건비·유가 정보는 공개 출처 기반의 참고용이며 실제 거래가격을 보장하지 않습니다." },
];

export default function LegalPage() {
  return (
    <AppShell title="약관·고지">
      <p className="mt-3 px-1 text-[11px] text-muted">
        ※ 아래 문구는 초안 예시이며 법률 자문이 아닙니다. 실제 출시 전 변호사·세무사 검토가 필요합니다.
      </p>
      <div className="mt-3 space-y-3">
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <h3 className="text-sm font-bold text-ink">{s.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{s.body}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

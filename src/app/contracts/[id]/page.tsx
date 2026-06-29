"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, Input, Textarea } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { biddingDb } from "@/lib/bidding";
import { formatKRW } from "@/lib/utils";
import type { Contract, ContractParty, SpecialClause } from "@/types/contract";
import { FileSignature, Plus, Trash2, Check, X, PencilLine, ShieldCheck, Send, Pen } from "lucide-react";

const PARTY_LABEL: Record<ContractParty, string> = { owner: "경영주", admin: "본부담당자", partner: "협력사" };
const STATUS: Record<Contract["status"], { label: string; tone: "neutral" | "primary" | "warn" | "success" | "danger" }> = {
  drafting: { label: "특약 작성", tone: "neutral" },
  partner_review: { label: "협력사 검토 중", tone: "primary" },
  revision_requested: { label: "수정 요청됨", tone: "warn" },
  signing: { label: "서명 진행", tone: "primary" },
  signed: { label: "체결 완료", tone: "success" },
  canceled: { label: "취소", tone: "danger" },
};

function defaultParty(role?: string): ContractParty {
  if (role === "PARTNER" || role === "MENTOR") return "partner";
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "admin";
  return "owner";
}

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [c, setC] = useState<Contract | null>(null);
  const [acting, setActing] = useState<ContractParty>("owner");
  const [newClause, setNewClause] = useState("");
  const [edit, setEdit] = useState<Record<string, string>>({});
  const [reviseFor, setReviseFor] = useState<string | null>(null);
  const [reviseNote, setReviseNote] = useState("");
  const [sigName, setSigName] = useState("");

  const reload = () => biddingDb.getContract(id).then(setC);
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [id]);
  useEffect(() => { setActing(defaultParty(user?.activeRole)); }, [user]);

  if (!c) return <AppShell title="계약서"><Card className="mt-6 text-center text-sm text-muted">불러오는 중…</Card></AppShell>;

  const isDrafter = acting === "owner" || acting === "admin";
  const canEdit = isDrafter && (c.status === "drafting" || c.status === "revision_requested");
  const allAccepted = c.clauses.every((cl) => cl.status === "accepted");
  const mySig = c.signatures.find((s) => s.party === acting);
  const expectedName = acting === "owner" ? c.ownerName : acting === "admin" ? c.adminName : c.partnerName;

  const act = async (fn: Promise<unknown>) => { await fn; reload(); };

  return (
    <AppShell title="3자 계약서">
      {/* 행동 주체 선택 (데모: 역할별 동작 시뮬레이션) */}
      <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {(["owner", "admin", "partner"] as ContractParty[]).map((p) => (
          <button key={p} onClick={() => setActing(p)}
            className={`rounded-lg py-2 text-xs font-bold ${acting === p ? "bg-white text-primary shadow-card" : "text-muted"}`}>
            {PARTY_LABEL[p]}{c.signatures.some((s) => s.party === p) && " ✓"}
          </button>
        ))}
      </div>
      <p className="mt-1 px-1 text-[11px] text-muted">현재 <b>{PARTY_LABEL[acting]}</b> 자격으로 보는 중 — 각 당사자 동작을 전환하며 진행할 수 있습니다.</p>

      {/* 계약 개요 */}
      <Card className="mt-3">
        <div className="flex items-center justify-between">
          <Badge tone="primary">{c.categoryName}</Badge>
          <Badge tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Badge>
        </div>
        <h1 className="mt-2 text-lg font-bold text-ink">{c.requestTitle}</h1>
        <div className="mt-1 text-sm text-muted">계약 금액 <b className="text-primary">{formatKRW(c.amount)}</b></div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <PartyChip label="경영주" name={c.ownerName} signed={c.signatures.some((s) => s.party === "owner")} />
          <PartyChip label="본부담당자" name={c.adminName} signed={c.signatures.some((s) => s.party === "admin")} />
          <PartyChip label="협력사" name={c.partnerName} signed={c.signatures.some((s) => s.party === "partner")} />
        </div>
      </Card>

      {/* 기본 계약서 양식 */}
      <h2 className="mb-2 mt-5 px-1 text-lg font-bold text-ink">기본 계약 조항</h2>
      <Card>
        <ol className="space-y-2">
          {c.baseTerms.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink">
              <span className="font-bold text-muted">제{i + 1}조</span><span>{t}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* 특약 */}
      <div className="mb-2 mt-5 flex items-center gap-1 px-1">
        <FileSignature className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-bold text-ink">특약 ({c.clauses.length})</h2>
      </div>
      <div className="space-y-2">
        {c.clauses.map((cl) => (
          <ClauseCard
            key={cl.id}
            cl={cl}
            acting={acting}
            status={c.status}
            editValue={edit[cl.id]}
            onEditChange={(v) => setEdit((e) => ({ ...e, [cl.id]: v }))}
            onSaveEdit={() => act(biddingDb.editClause(c.id, cl.id, edit[cl.id] ?? cl.text)).then(() => setEdit((e) => { const n = { ...e }; delete n[cl.id]; return n; }))}
            onRemove={() => act(biddingDb.removeClause(c.id, cl.id))}
            canEdit={canEdit}
            onAccept={() => act(biddingDb.respondClause(c.id, cl.id, "accept"))}
            onReviseOpen={() => { setReviseFor(cl.id); setReviseNote(""); }}
            reviseOpen={reviseFor === cl.id}
            reviseNote={reviseNote}
            onReviseNote={setReviseNote}
            onReviseSubmit={() => act(biddingDb.respondClause(c.id, cl.id, "revise", reviseNote)).then(() => setReviseFor(null))}
          />
        ))}
        {c.clauses.length === 0 && <Card className="text-center text-xs text-muted">등록된 특약이 없습니다. 기본 조항만으로 진행할 수 있습니다.</Card>}
      </div>

      {/* 특약 추가 (경영주/본부, 작성 단계) */}
      {canEdit && (
        <Card className="mt-2">
          <label className="mb-1 block text-sm font-semibold text-ink">{PARTY_LABEL[acting]} 특약 추가</label>
          <Textarea className="min-h-16" placeholder="예: 작업 후 폐기물은 협력사가 전량 반출한다." value={newClause} onChange={(e) => setNewClause(e.target.value)} />
          <Button className="mt-2 w-full" disabled={!newClause.trim()} onClick={() => act(biddingDb.addClause(c.id, acting as "owner" | "admin", newClause.trim())).then(() => setNewClause(""))}>
            <Plus className="h-4 w-4" /> 특약 추가
          </Button>
        </Card>
      )}

      {/* 단계 전환 버튼 */}
      <div className="mt-4">
        {canEdit && (
          <Button size="lg" className="w-full" onClick={() => act(biddingDb.sendToReview(c.id))}>
            <Send className="h-4 w-4" /> 협력사에 검토·승인 요청
          </Button>
        )}
        {acting === "partner" && c.status === "partner_review" && (
          <Button size="lg" className="w-full" disabled={!allAccepted}
            onClick={() => act(biddingDb.partnerApprove(c.id))}>
            <Check className="h-4 w-4" /> 계약 최종 승인 (서명 단계로)
          </Button>
        )}
        {acting === "partner" && c.status === "partner_review" && !allAccepted && (
          <p className="mt-2 px-1 text-center text-[11px] text-muted">모든 특약을 수용해야 최종 승인할 수 있습니다. 받아들이기 어려우면 수정요청하세요.</p>
        )}
        {c.status === "revision_requested" && acting === "partner" && (
          <p className="px-1 text-center text-[11px] text-muted">수정요청을 보냈습니다. 경영주/본부의 특약 수정 후 다시 검토 요청됩니다.</p>
        )}
      </div>

      {/* 서명 단계 */}
      {(c.status === "signing" || c.status === "signed") && (
        <>
          <h2 className="mb-2 mt-6 flex items-center gap-1 px-1 text-lg font-bold text-ink"><Pen className="h-4 w-4 text-primary" /> 디지털 서명</h2>
          <div className="space-y-2">
            {(["owner", "admin", "partner"] as ContractParty[]).map((p) => {
              const sig = c.signatures.find((s) => s.party === p);
              return (
                <Card key={p}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink">{PARTY_LABEL[p]}</span>
                    {sig ? <Badge tone="success"><ShieldCheck className="mr-0.5 h-3 w-3" />서명 완료</Badge> : <Badge tone="neutral">미서명</Badge>}
                  </div>
                  {sig ? (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="signature-name">{sig.name}</div>
                      <div className="mt-1 text-[11px] text-muted">{new Date(sig.signedAt).toLocaleString("ko-KR")} 전자서명</div>
                    </div>
                  ) : acting === p ? (
                    <div className="mt-2">
                      <Input placeholder={`정자체로 본인 이름 입력 (예: ${expectedName})`} value={sigName} onChange={(e) => setSigName(e.target.value)} />
                      <Button className="mt-2 w-full" disabled={!sigName.trim()} onClick={() => act(biddingDb.sign(c.id, p, sigName.trim())).then(() => setSigName(""))}>
                        <Pen className="h-4 w-4" /> {PARTY_LABEL[p]} 서명하기
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-muted">{PARTY_LABEL[p]} 자격으로 전환 후 서명할 수 있습니다.</p>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}

      {c.status === "signed" && (
        <Card className="mt-3 border border-green-200 bg-green-50/50 text-center">
          <ShieldCheck className="mx-auto h-9 w-9 text-success" />
          <h3 className="mt-2 text-base font-bold text-ink">계약이 체결되었습니다</h3>
          <p className="mt-1 text-xs text-muted">경영주·본부담당자·협력사 3자 전자서명이 완료되어 본 건 계약서가 확정되었습니다.</p>
        </Card>
      )}
    </AppShell>
  );
}

function PartyChip({ label, name, signed }: { label: string; name: string; signed: boolean }) {
  return (
    <div className={`rounded-xl border p-2 ${signed ? "border-success bg-green-50/50" : "border-slate-200 bg-slate-50"}`}>
      <div className="text-[10px] text-muted">{label}</div>
      <div className="truncate text-xs font-bold text-ink">{name}</div>
      <div className={`text-[10px] font-semibold ${signed ? "text-success" : "text-muted"}`}>{signed ? "서명완료" : "대기"}</div>
    </div>
  );
}

function ClauseCard({
  cl, acting, status, editValue, onEditChange, onSaveEdit, onRemove, canEdit,
  onAccept, onReviseOpen, reviseOpen, reviseNote, onReviseNote, onReviseSubmit,
}: {
  cl: SpecialClause; acting: ContractParty; status: Contract["status"];
  editValue?: string; onEditChange: (v: string) => void; onSaveEdit: () => void; onRemove: () => void; canEdit: boolean;
  onAccept: () => void; onReviseOpen: () => void; reviseOpen: boolean; reviseNote: string; onReviseNote: (v: string) => void; onReviseSubmit: () => void;
}) {
  const editing = editValue !== undefined;
  const canRespond = acting === "partner" && status === "partner_review" && cl.status !== "accepted";
  const TONE = { proposed: "neutral", accepted: "success", revision_requested: "warn" } as const;
  const SLABEL = { proposed: "검토 대기", accepted: "수용됨", revision_requested: "수정요청" };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <Badge tone="neutral">{PARTY_LABEL[cl.party]} 특약</Badge>
        <Badge tone={TONE[cl.status]}>{SLABEL[cl.status]}</Badge>
      </div>
      {editing ? (
        <Textarea className="mt-2 min-h-16" value={editValue} onChange={(e) => onEditChange(e.target.value)} />
      ) : (
        <p className="mt-2 text-sm text-ink">{cl.text}</p>
      )}
      {cl.revisionNote && !editing && (
        <p className="mt-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-700">협력사 수정요청: {cl.revisionNote}</p>
      )}

      {/* 경영주/본부: 수정/삭제 */}
      {canEdit && cl.party === acting && (
        <div className="mt-2 flex gap-2">
          {editing ? (
            <Button size="md" className="flex-1" onClick={onSaveEdit}><Check className="h-4 w-4" /> 저장</Button>
          ) : (
            <Button size="md" variant="outline" className="flex-1" onClick={() => onEditChange(cl.text)}><PencilLine className="h-4 w-4" /> 수정</Button>
          )}
          <Button size="md" variant="outline" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
        </div>
      )}

      {/* 협력사: 수용/수정요청 */}
      {canRespond && !reviseOpen && (
        <div className="mt-2 flex gap-2">
          <Button size="md" className="flex-1" onClick={onAccept}><Check className="h-4 w-4" /> 수용</Button>
          <Button size="md" variant="outline" className="flex-1" onClick={onReviseOpen}><X className="h-4 w-4" /> 수정요청</Button>
        </div>
      )}
      {canRespond && reviseOpen && (
        <div className="mt-2">
          <Textarea className="min-h-16" placeholder="수정요청 사유·대안을 적어주세요" value={reviseNote} onChange={(e) => onReviseNote(e.target.value)} />
          <Button size="md" className="mt-2 w-full" disabled={!reviseNote.trim()} onClick={onReviseSubmit}>수정요청 보내기</Button>
        </div>
      )}
    </Card>
  );
}

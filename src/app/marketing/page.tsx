"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, Input, Textarea } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { phase2db } from "@/lib/phase2";
import type { SocialAccount, SocialPost, SocialPlatform } from "@/types/phase2";
import { Instagram, Youtube, Megaphone, Send, Clock, CheckCircle2, Music } from "lucide-react";

const PLATFORM_META: Record<SocialPlatform, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  instagram: { label: "인스타그램", icon: Instagram },
  youtube: { label: "유튜브", icon: Youtube },
};

export default function MarketingPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [targets, setTargets] = useState<SocialPlatform[]>(["instagram"]);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState("");
  const [when, setWhen] = useState("");

  const reload = () => {
    if (!user) return;
    phase2db.socialAccounts(user.uid).then(setAccounts);
    phase2db.listPosts(user.uid).then(setPosts);
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [user]);

  const toggle = (p: SocialPlatform) =>
    setTargets((t) => (t.includes(p) ? t.filter((x) => x !== p) : [...t, p]));

  const schedule = async () => {
    if (!user || !caption || targets.length === 0) return;
    await phase2db.schedulePost({
      uid: user.uid, platforms: targets, caption, mediaName: media || "video.mp4",
      scheduledAt: when || new Date(Date.now() + 86400000).toISOString(),
    });
    setCaption(""); setMedia(""); setWhen("");
    reload();
  };

  return (
    <AppShell title="마케팅 자동화">
      <Card className="mt-2 flex items-center gap-2 bg-primary-soft">
        <Megaphone className="h-5 w-5 text-primary" />
        <p className="text-xs text-primary">영상 하나로 인스타·유튜브에 <b>한 번에 예약 게시</b>. 뒷광고 표시는 자동 삽입됩니다.</p>
      </Card>

      {/* 계정 연동 */}
      <h2 className="mb-2 mt-5 px-1 text-sm font-bold text-muted">연동 계정</h2>
      <div className="grid grid-cols-2 gap-2">
        {(["instagram", "youtube"] as SocialPlatform[]).map((p) => {
          const M = PLATFORM_META[p];
          const acc = accounts.find((a) => a.platform === p);
          return (
            <Card key={p} className="flex items-center gap-2">
              <M.icon className="h-5 w-5 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-ink">{M.label}</div>
                <div className="truncate text-[11px] text-muted">{acc?.connected ? acc.handle : "미연동"}</div>
              </div>
              {acc?.connected ? <Badge tone="success">연동</Badge> : <button className="text-xs font-semibold text-primary" onClick={() => alert("OAuth 연동 화면으로 이동 (데모)")}>연동</button>}
            </Card>
          );
        })}
      </div>

      {/* 새 게시물 */}
      <h2 className="mb-2 mt-5 px-1 text-lg font-bold text-ink">새 영상 예약 발행</h2>
      <Card className="space-y-2">
        <Input placeholder="영상 파일명 (업로드 데모)" value={media} onChange={(e) => setMedia(e.target.value)} />
        <Textarea placeholder="캡션 / 설명 (해시태그 포함)" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <div className="flex gap-2">
          {(["instagram", "youtube"] as SocialPlatform[]).map((p) => {
            const M = PLATFORM_META[p];
            const on = targets.includes(p);
            return (
              <button key={p} onClick={() => toggle(p)} className={`flex flex-1 items-center justify-center gap-1 rounded-xl border py-2 text-xs font-semibold ${on ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-muted"}`}>
                <M.icon className="h-4 w-4" /> {M.label}
              </button>
            );
          })}
        </div>
        <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        <div className="flex items-center gap-1 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-muted">
          <Music className="h-3.5 w-3.5" /> 저작권 안전 음원·소재만 선택 가능 · 뒷광고(유료광고 포함) 표시 자동 삽입
        </div>
        <Button className="w-full" onClick={schedule}><Send className="h-4 w-4" /> 예약 발행</Button>
      </Card>

      {/* 발행 큐 */}
      <h2 className="mb-2 mt-6 px-1 text-lg font-bold text-ink">발행 큐 ({posts.length})</h2>
      <div className="space-y-2">
        {posts.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  {p.platforms.map((pl) => { const M = PLATFORM_META[pl]; return <M.icon key={pl} className="h-4 w-4 text-muted" />; })}
                  {p.adDisclosure && <Badge tone="neutral">#광고표시</Badge>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-ink">{p.caption}</p>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-muted"><Clock className="h-3 w-3" /> {new Date(p.scheduledAt).toLocaleString("ko-KR")}</div>
              </div>
              {p.status === "queued" ? <Badge tone="warn">예약됨</Badge> : <Badge tone="success"><CheckCircle2 className="mr-0.5 h-3 w-3" />게시</Badge>}
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-4 px-1 text-[11px] leading-relaxed text-muted">
        ⚠️ 인스타그램/유튜브 API·자동화 정책을 준수하며, 과도한 자동화·스팸은 차단됩니다. 사용자 본인 계정 OAuth 연동·동의 기반으로만 게시합니다.
      </p>
    </AppShell>
  );
}

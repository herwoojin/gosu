# 우리동네고수 — GUIDE.md (개발·배포·운영 가이드)

> Antigravity IDE + Claude Opus로 구현할 때 그대로 참조할 수 있는 셋업/규칙/디자인/법적고지 모음.

---

## 1. 사전 준비

- Node.js 20+, pnpm(또는 npm), Git
- 계정/프로젝트: Firebase, Supabase, 토스페이먼츠(샌드박스), 공공데이터포털(국세청 API), 카카오 개발자, Anthropic API
- macOS/Windows 모두 지원(기존 개발환경과 동일)

---

## 2. 초기 셋업

```bash
pnpm create next-app@latest wooridongne-gosu --ts --app --tailwind --eslint
cd wooridongne-gosu
pnpm add @supabase/supabase-js firebase @tanstack/react-query zod
pnpm add -D @types/node
# shadcn/ui
pnpm dlx shadcn@latest init
```

`.env.local` (TRD §10 참조, 비밀키는 서버 전용):
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE=...
NTS_BIZ_API_KEY=...
TOSS_SECRET_KEY=...
ANTHROPIC_API_KEY=...
KAKAO_REST_API_KEY=...
```

---

## 3. Firebase Auth ↔ Supabase 연동 절차

1. Firebase 콘솔: Authentication → Google, Email/Password 활성화.
2. Supabase: **Authentication → Third-Party Auth → Firebase** 추가(프로젝트ID 등록).
3. 클라이언트: 로그인 후 Firebase **ID 토큰**을 Supabase 클라이언트 `accessToken`으로 주입.
4. RLS 정책에서 `auth.jwt() ->> 'sub'`를 Firebase uid로 사용.
5. 신규 로그인 시 `users` upsert(서버) → 기본 역할 OWNER 부여(협력사 신청 시 PARTNER 추가, 승인은 ADMIN).

```ts
// lib/supabase.ts (개념)
const token = await firebaseUser.getIdToken();
const supabase = createClient(URL, ANON, {
  global: { headers: { Authorization: `Bearer ${token}` } },
});
```

---

## 4. DB 마이그레이션

```bash
supabase init
supabase start            # 로컬
# erd.md의 DDL을 supabase/migrations/0001_init.sql 로 작성
supabase db push          # 원격 적용
```
- PostGIS 활성화: `create extension if not exists postgis;`
- RLS: 모든 테이블 `enable row level security` + 정책 작성(기본 deny).

---

## 5. Edge Functions

```
supabase/functions/
 ├─ verify-biz/      # 국세청 진위확인(서버키)
 ├─ match/           # 매칭 쿼리 + 알림 큐
 ├─ toss-webhook/    # 즉시결제 승인 웹훅
 ├─ ai-quote/        # Claude API 프록시(견적서 생성)
 └─ notify/          # FCM/알림톡 발송(수신동의·야간제한 체크)
```
- 배포: `supabase functions deploy <name>`
- 비밀키는 `supabase secrets set KEY=...`

---

## 6. PWA & APK

1. `public/manifest.webmanifest`
```json
{
  "name": "우리동네고수",
  "short_name": "고수",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {"src":"/icons/icon-192.png","sizes":"192x192","type":"image/png"},
    {"src":"/icons/icon-512.png","sizes":"512x512","type":"image/png"},
    {"src":"/icons/maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}
  ]
}
```
2. Service Worker: `next-pwa` 또는 커스텀 SW(앱셸 캐시 + FCM 백그라운드).
3. 빌드/배포: `pnpm build` → Vercel/Netlify.
4. **APK 생성**: `https://www.pwabuilder.com` 접속 → 배포 URL 입력 → Android 패키지(.aab/.apk) 생성·다운로드 → (필요 시) Play Console 또는 사내 배포.

---

## 7. 디자인 시스템

### 7.1 폰트 — Paperlogy
- `/public/fonts/paperlogy/`에 woff2 배치(라이선스 확인). `@font-face`는 TRD §8.
- Tailwind:
```js
// tailwind.config.js
fontFamily: { sans: ['Paperlogy','Pretendard','system-ui','sans-serif'] }
```

### 7.2 컬러(예시 토큰)
| 토큰 | 값 | 용도 |
|---|---|---|
| primary | #2563EB | 주요 버튼/링크 |
| primary-soft | #EAF1FF | 카드 아이콘 배경 |
| ink | #0F172A | 본문 |
| muted | #64748B | 보조 텍스트 |
| surface | #FFFFFF | 카드 |
| bg | #F5F8FF | 배경 |
| success/warn/danger | #16A34A/#F59E0B/#DC2626 | 상태 |

### 7.3 레이아웃 원칙(모바일 우선)
- 1열 카드 그리드(데스크탑 3열), 큰 터치 영역(≥44px), 한 화면 한 의사결정.
- 견적요청 마법사: 상단 진행바 + 하단 고정 "다음/이전".
- 입찰비교: 카드형(가격·평점·일정·후기) 정렬 토글.
- 접근성: 큰 글씨 토글, 명도대비 AA, 폼 라벨/aria.

---

## 8. 코딩 컨벤션

- TypeScript strict, 함수형 컴포넌트, 서버액션/Edge Function로 비밀로직 분리.
- 데이터 접근은 `features/*/api.ts`로 캡슐화, Zod로 입출력 검증.
- 비밀키는 절대 클라이언트 번들에 포함 금지(검사: `NEXT_PUBLIC_` 외 키 노출 여부).
- 커밋: Conventional Commits, PR 단위 기능.
- 문서화 우선(PRD→TRD→ERD→GUIDE→TASK→PROMPT) 워크플로우 유지.

---

## 9. 법적 고지문 템플릿 (반드시 변호사·세무사 검토)

> 아래 문구는 초안 예시이며 법률 자문이 아니다. 실제 적용 전 전문가 검토 필수.

### 9.1 통신판매중개자 고지(푸터/약관)
"우리동네고수는 통신판매중개자로서 거래 당사자가 아니며, 요청자와 협력사 간 거래·서비스의 책임은 거래 당사자에게 있습니다. 협력사의 자격·이행에 대한 최종 확인 책임은 이용자에게 있습니다."

### 9.2 협력사 등록 동의(진위확인)
"입력하신 사업자등록번호는 국세청 사업자등록정보 진위확인 서비스를 통해 검증됩니다. 허위 정보 등록 시 이용이 제한될 수 있습니다."

### 9.3 무사업자 참여·원천징수 안내
"사업자등록이 없는 개인으로 용역을 제공하는 경우, 지급액에 대해 관련 세법에 따른 원천징수(예: 사업소득 3.3%)가 적용될 수 있으며, 지급명세서가 작성될 수 있습니다."

### 9.4 결제 구조 고지
"즉시결제는 라이선스 결제대행사를 통해 처리되며, 본부결제는 본부가 협력사에 직접 지급하는 방식입니다. 우리동네고수는 거래 대금을 직접 보관·중계하지 않습니다."

### 9.5 위치·민감정보
"점포/서비스 지역 매칭을 위해 위치정보를 수집·이용하며, 원천징수 등 법령상 필요한 경우에 한해 고유식별정보를 수집할 수 있습니다."

### 9.6 후기·평점 운영원칙
"후기는 실제 이용 기반으로 작성되어야 하며, 허위·조작 후기는 제한됩니다. 협력사는 부당한 평가에 대해 이의신청·정정을 요청할 수 있습니다."

### 9.7 단가·표준인건비 참고 고지
"제공되는 단가·표준인건비·유가 정보는 공개 출처 기반의 참고용이며 실제 거래가격을 보장하지 않습니다."

### 9.8 AI 견적서 고지
"AI가 생성한 견적서 양식은 초안이며, 최종 금액·내용의 정확성과 진위에 대한 책임은 작성자에게 있습니다."

---

## 10. 운영 체크리스트
- [ ] RLS 정책 테스트(역할별 접근)
- [ ] 진위확인 게이트 통과 전 협력사 노출 차단
- [ ] 즉시결제 웹훅 멱등 처리
- [ ] 본부결제 승인 감사로그
- [ ] 알림 수신동의·야간 제한
- [ ] 약관/개인정보처리방침/통신판매중개 고지 버전관리
- [ ] PWA 설치·APK 동작 검증(안드로이드/태블릿)

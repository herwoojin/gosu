# 우리동네고수 — TECH_STACK.md

> 한줄 요약: **Next.js 14 App Router 모바일 PWA** — 인증은 Firebase, 데이터는 **어댑터(mock→Firebase 예정)**, 지도는 **OpenStreetMap(Leaflet)** 으로 내 점포·근처 고수 표시 및 컨설팅 호출. 외부 키 미설정 시 **데모 모드**로 localhost 전 화면 동작.
> 마지막 업데이트: **2026-06-26**

## 1. 아키텍처

```
[모바일 PWA: Next.js 14]
   │  로그인               데이터/매칭
   ▼                       ▼
[Firebase Auth] ──ID토큰──► [Supabase Postgres + PostGIS + RLS]
   (Google/Email)               │
                                ├─ Edge Functions (verify-biz / match / toss-webhook / ai-quote / notify)
                                └─ Storage (사진/자격증/견적서)
외부: 국세청 진위확인 · 도로명주소 · 토스페이먼츠 · FCM · 카카오 알림톡 · 오피넷 · Claude API
```

> **데모 모드:** `NEXT_PUBLIC_FIREBASE_*` / `NEXT_PUBLIC_SUPABASE_*` 가 비어 있으면
> `src/lib/env.ts`가 자동 감지하여 `src/lib/demo-data.ts`의 mock 데이터로 전 화면을 구동한다. 키를 채우면 코드 변경 없이 실서비스로 전환된다.

## 2. 카테고리별 구성

| 영역 | 이름 | 버전 | 용도 | 위치 |
|---|---|---|---|---|
| 프론트 | Next.js | 14.2.x | App Router PWA | `next.config.mjs` |
| 프론트 | React / TypeScript | 18.3 / 5.6 | UI / 타입(strict) | `tsconfig.json` |
| 지도 | Leaflet + react-leaflet | 1.9 / 4.2 | OSM 점포·근처 고수 지도, 위치 선택 | `src/components/map/*` |
| 데이터 | 데이터 어댑터(DataProvider) | — | DB 추상화(mock→Firebase 교체) | `src/lib/data/*` |
| 연동 | 웹훅/외부 API 목업 | — | 이벤트 발신·수신기 | `src/lib/data/webhook.ts`, `/api/webhooks` |
| 지오 | 하버사인 거리 | — | 점포↔고수 거리(PostGIS 대체) | `src/lib/geo.ts` |
| 스타일 | Tailwind CSS | 3.4.x | 디자인 토큰 | `tailwind.config.ts` |
| 폰트 | Paperlogy | woff2 | 브랜드 폰트(폴백 Pretendard) | `src/app/globals.css` |
| 상태 | TanStack Query | 5.x | 서버 상태 | `src/components/Providers.tsx` |
| 검증 | Zod | 3.x | 입출력 스키마 | `src/types`, features |
| 인증 | Firebase Auth | 10.x | Google/Email | `src/lib/firebase.ts` |
| 데이터 | Supabase + PostGIS | — | 관계형 + 지오매칭 + RLS | (백엔드) |
| 서버로직 | Edge Functions (Deno) | — | 진위확인/매칭/결제/AI/알림 | `supabase/functions/*` (예정) |
| AI | Anthropic Claude API | — | AI 견적서(서버 프록시) | `ai-quote` |
| 결제 | 토스페이먼츠 | — | 즉시결제·에스크로 | `toss-webhook` |
| 알림 | FCM / 카카오 알림톡 | — | 웹푸시 / 협력사 알림 | `notify` |
| 가시성 | 서버 배터리 | — | 용량 신호등 30s 폴링 | `src/components/ServerBattery.tsx`, `src/app/api/server-health/route.ts` |
| PWA | SW + Manifest | — | 오프라인·설치 | `public/sw.js`, `public/manifest.webmanifest` |

## 3. 왜 이 선택인가

- **Firebase Auth + Supabase 분리:** 로그인 UX는 Firebase가 강하고, 공종×지역 **지오매칭/관계형 단가 분석**은 PostGIS가 필수라 Supabase로 분리. Firebase ID 토큰을 Supabase RLS(`auth.jwt()->>'sub'`)로 연결.
- **App Router + 모바일 우선:** 1열 카드·큰 터치영역·하단 고정 네비로 고령 점주도 한손 조작.
- **데모 모드:** 외부 계정/키 없이도 즉시 localhost 실행·시연 가능 → 온보딩/리뷰 비용 절감.

## 4. 외부 의존 서비스 — 헬스/요금 영향

| 서비스 | 요금 영향 | 비고 |
|---|---|---|
| Firebase Auth | 무료 티어 충분 | MAU 기반 |
| Supabase | Free→Pro | PostGIS·Edge Functions 사용량 |
| 토스페이먼츠 | 거래 수수료 | 즉시결제만, 본부결제는 PG 미경유 |
| Claude API | 토큰 과금 | AI 견적서 호출 시 |
| 국세청/오피넷/도로명 | 공공데이터 무료 | 호출 한도 존재 |

## 5. 컨설팅 + 지도 기능 (2026-06-26 추가)

- **데이터 어댑터:** `src/lib/data/provider.ts` 인터페이스 → 현재 `mock.ts`(localStorage) 구현. 추후 `firebase.ts` 추가 후 `index.ts`에서 교체만 하면 됨. 페이지는 `db.*` async 호출만 사용해 전환 무중단.
- **OSM 지도:** `/owner/store`에서 점포 위치를 지도 클릭/드래그(또는 Nominatim 주소검색)로 등록 → `/owner/nearby`에서 내 점포 기준 **거리순 근처 고수**를 지도+리스트로 표시. **OSM 저작권 표기** 모든 지도에 부착.
- **컨설팅 2종(양방향 선택):** 협력사가 `/partner/consulting`에서 무료 AS / 유료 출장(요금) 제공 여부 설정 → 경영주는 `/owner/nearby`에서 협력사가 제공하는 모드만 골라 요청. 상태 전이: requested→accepted→scheduled→completed / declined.
- **웹훅:** 컨설팅·점포 이벤트 발생 시 `emitWebhook` → `/api/webhooks`(목업 수신·콘솔 로그). localStorage에 최근 50건 로그 적재.

## 6. 알려진 한계 (현재 빌드)

- 데이터는 **mock(localStorage)** — 브라우저별 로컬 저장. Firebase Firestore/Storage 연동은 어댑터 `firebase.ts` 구현 후 활성 예정.
- Nominatim 지오코딩은 무료 공개 서비스로 **rate limit** 존재 → 실패 시 지도 클릭으로 직접 지정(폴백 내장).
- 결제·FCM·진위확인·AI 견적서는 **UI/플로우만** 동작(실 API 미연동).
- Paperlogy woff2 미배치 → 폴백 폰트 렌더(라이선스 확인 후 `public/fonts/paperlogy/`에 배치).

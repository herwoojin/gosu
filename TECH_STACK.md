# 우리동네고수 — TECH_STACK.md

> 한줄 요약: **Next.js 14 App Router 모바일 PWA** — 인증은 Firebase, 데이터는 **어댑터(mock→Firebase 예정)**, 지도는 **OpenStreetMap(Leaflet)** 으로 내 점포·근처 고수 표시 및 컨설팅 호출. 외부 키 미설정 시 **데모 모드**로 localhost 전 화면 동작.
> 마지막 업데이트: **2026-06-27** (Phase 2 — 휴먼 리소스 디스커버리 M1~M9 추가)

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
      · 소상공인 상가정보(data.go.kr) · 키스콘 건설업체(data.go.kr)
```

> **데모 모드:** `NEXT_PUBLIC_FIREBASE_*` / `NEXT_PUBLIC_SUPABASE_*` 가 비어 있으면
> `src/lib/env.ts`가 자동 감지하여 `src/lib/demo-data.ts`의 mock 데이터로 전 화면을 구동한다. 키를 채우면 코드 변경 없이 실서비스로 전환된다.

## 2. 카테고리별 구성

| 영역 | 이름 | 버전 | 용도 | 위치 |
|---|---|---|---|---|
| 프론트 | Next.js | 14.2.x | App Router PWA | `next.config.mjs` |
| 프론트 | React / TypeScript | 18.3 / 5.6 | UI / 타입(strict) | `tsconfig.json` |
| 지도 | Leaflet + react-leaflet | 1.9 / 4.2 | OSM 점포·근처 고수·상권 지도, 위치 선택 | `src/components/map/*` |
| 공공데이터 | 소상공인 상가정보 API | — | 반경내 상가업소 → 업종·주소별 핀(`/owner/market`) | 서버 프록시 `src/app/api/public/shops/route.ts` |
| 공공데이터 | 키스콘 건설업체 API | — | 건설업체 등록/처분(좌표 없음, 보조) | `data.go.kr/1613000/ConAdminInfoSvc1` |
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
| 소상공인 상가정보 / 키스콘 | 공공데이터 무료 | 일 10,000건 한도, 키 `DATA_GO_KR_API_KEY` 공용 |

## 5. 컨설팅 + 지도 기능 (2026-06-26 추가)

- **데이터 어댑터:** `src/lib/data/provider.ts` 인터페이스 → 현재 `mock.ts`(localStorage) 구현. 추후 `firebase.ts` 추가 후 `index.ts`에서 교체만 하면 됨. 페이지는 `db.*` async 호출만 사용해 전환 무중단.
- **OSM 지도:** `/owner/store`에서 점포 위치를 지도 클릭/드래그(또는 Nominatim 주소검색)로 등록 → `/owner/nearby`에서 내 점포 기준 **거리순 근처 고수**를 지도+리스트로 표시. **OSM 저작권 표기** 모든 지도에 부착.
- **컨설팅 2종(양방향 선택):** 협력사가 `/partner/consulting`에서 무료 AS / 유료 출장(요금) 제공 여부 설정 → 경영주는 `/owner/nearby`에서 협력사가 제공하는 모드만 골라 요청. 상태 전이: requested→accepted→scheduled→completed / declined.
- **웹훅:** 컨설팅·점포 이벤트 발생 시 `emitWebhook` → `/api/webhooks`(목업 수신·콘솔 로그). localStorage에 최근 50건 로그 적재.

## 6. 상권 지도 — 업종·주소별 핀 (2026-06-26 추가)

- **`/owner/market`:** 내 점포 좌표 기준 **소상공인 상가정보 API(`/storeListInRadius`)** 를 서버 프록시(`/api/public/shops`)로 호출 → 상가업소를 **상권업종 대분류별 색상 핀(CircleMarker)** 으로 지도에 표기. 팝업에 상호·업종(소분류)·도로명주소 노출.
- **필터/범례:** 결과에서 대분류를 집계해 색상 칩으로 표시, 탭하면 해당 업종만 on/off. 반경 500m/1km/2km 선택.
- **키 보안:** 서비스키(Decoding)는 `DATA_GO_KR_API_KEY`(서버 전용)로만 사용, 클라이언트 미노출. 키 미설정 시 좌표 주변 **데모 핀**으로 동작(데모 모드 일관성).
- **색상 매핑:** `src/lib/publicData.ts`의 `LCLS_COLORS`(음식·소매·생활서비스·교육·부동산·숙박·관광/여가/오락·스포츠 등) + 미지정 분류 해시 폴백.

## 7. Phase 2 — 휴먼 리소스 디스커버리 (2026-06-27 추가)

Phase 1(시설 유지보수 매칭) 위에 "누구나 고수가 되고 어디서나 일하는" 9개 모듈을 **mock(localStorage) 데모**로 구현. 진입점은 모든 화면 헤더의 ✨ 버튼과 하단 **고수+** 탭 → `/discover`.

| 모듈 | 화면 | 핵심 |
|---|---|---|
| M1 N잡러 프로필 | `/me`, `/me/skills` | 잘하는/배우고싶은 분야·숙련도, 분야별 수익 |
| M9 위치기반 추천 | `/me/recommend` | 강점×근처수요(할 일)+희망×코스(배울 것)+평균수익(벌이), GPS 동의 |
| M3 점수·단가 | `/trust`, `/pricing-guide` | 신뢰/친절/다시만나요→등급(새싹/일반/우수/마스터)→권장 단가배수(베이지안 평활) |
| M2 캠프 | `/camp`, `/camp/[id]`, `/mentor` | 코스·기수·수강·수료(민간 수료증)→고수 활동 활성, 멘토 코스 개설 |
| M5 1인 커머스 | `/shop` | 개인 브랜드 상점·상품, **식품=영업신고 검증 게이트** |
| M6 마케팅 자동화 | `/marketing` | 인스타/유튜브 예약발행 큐, 뒷광고 자동표시 |
| M7 오프라인 거점 | `/venues` | 공실→교육·커뮤니티·판매 거점 |
| M4 이주·바우처 | `/relocate`, `/lgu` | 지자체 협약·주거/교통 보조·온누리상품권(자금 미보관, 승인+발급) |
| M8 글로벌 워커 | `/global` | 입국 전 합법 사전 매칭·비자/EPS 안내·i18n(한/영) |

- **신규 역할:** `MENTOR`(코스 개설), `LGU`(협약·바우처), `WORKER_GLOBAL`(사전 매칭). 로그인 데모 화면에서 선택 가능, `roleHome`·`BottomNav` 역할별 분기.
- **엔진:** `src/lib/phase2/engines.ts` — `computeTrustScore`(M3), `recommend`(M9)는 순수 함수(데모는 클라 계산, 실서비스는 Edge Function `score-engine`/`recommend-jobs`로 이전).
- **데이터:** `src/lib/phase2/index.ts`(phase2db) + `src/lib/phase2/demo.ts` 시드. Phase 1 `db`와 동일하게 async 시그니처 유지 → Firebase/Supabase 전환 시 구현만 교체.
- **검증 게이트:** 식품 판매(영업신고)·멘토(자격/승인)·글로벌(비자/EPS)은 통과 전 비활성/안내. ⚠️ 모든 모듈은 관련 법령(직업안정법·학원/평생교육/자격기본법·식품위생법·전자상거래법·SNS 약관·외국인고용법) 준수 및 전문가 검토 전제.

## 8. 알려진 한계 (현재 빌드)

- 데이터는 **mock(localStorage)** — 브라우저별 로컬 저장. Firebase Firestore/Storage 연동은 어댑터 `firebase.ts` 구현 후 활성 예정.
- Nominatim 지오코딩은 무료 공개 서비스로 **rate limit** 존재 → 실패 시 지도 클릭으로 직접 지정(폴백 내장).
- 결제·FCM·진위확인·AI 견적서는 **UI/플로우만** 동작(실 API 미연동).
- Paperlogy woff2 미배치 → 폴백 폰트 렌더(라이선스 확인 후 `public/fonts/paperlogy/`에 배치).
- **키스콘 건설업체 API**는 좌표를 제공하지 않고 검색 필터 없이는 결과가 비어(`totalCount 0`) 현재 지도 핀 미연동 — 활용가이드 확인 후 검색 파라미터·지오코딩(카카오) 추가 시 보조 레이어로 확장 가능.
- 소상공인 API `radius`는 **최대 2km**, 1회 `numOfRows` 상한 존재 → 넓은 영역은 페이지네이션 필요(현재 200건/반경 단위).
- **Phase 2 전 모듈은 mock(localStorage) 데모** — 결제·SNS OAuth·바우처 실발급·비자 검증·영업신고 검증은 UI/플로우만 동작(실 API/Edge Function 미연동). 점수·추천 엔진은 데모용 시드 기반 클라 계산.

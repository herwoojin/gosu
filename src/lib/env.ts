// 환경 감지: 필수 키가 비어 있으면 데모 모드로 동작한다.
// 클라이언트/서버 양쪽에서 안전하게 호출 가능 (NEXT_PUBLIC_* 만 클라에서 읽힘).

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
};

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export const hasFirebase =
  !!firebaseConfig.apiKey && !!firebaseConfig.projectId && !!firebaseConfig.appId;

export const hasSupabase = !!supabaseConfig.url && !!supabaseConfig.anonKey;

// 공공데이터(소상공인 상가정보 등) 서비스키 — 서버 전용. 미설정 시 상권 지도는 데모 핀.
export const hasPublicData = !!process.env.DATA_GO_KR_API_KEY;

// 데모 모드: Firebase 미설정 시 mock 데이터로 전 화면 동작
// (Supabase 대신 Firestore를 DB로 사용하므로 Firebase만 체크)
export const isDemoMode = !hasFirebase;

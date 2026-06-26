// Firebase 초기화 — Auth + Firestore 헬퍼
// 키가 있을 때만 초기화한다(데모 모드에선 import만 하고 미사용).
import { hasFirebase, firebaseConfig } from "./env";
import type { FirebaseApp } from "firebase/app";

let cachedApp: FirebaseApp | null = null;

/** Firebase App 싱글톤 — 키 미설정 시 null 반환 */
async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (!hasFirebase) return null;
  if (cachedApp) return cachedApp;
  const { initializeApp, getApps } = await import("firebase/app");
  cachedApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return cachedApp;
}

/** Firebase Auth 인스턴스 반환 — 구글 로그인에 사용 */
export async function getFirebaseAuth() {
  const app = await getFirebaseApp();
  if (!app) return null;
  const { getAuth } = await import("firebase/auth");
  return getAuth(app);
}

/** Firestore 인스턴스 반환 — 데이터베이스 CRUD에 사용 */
export async function getFirestore() {
  const app = await getFirebaseApp();
  if (!app) return null;
  const { getFirestore: _getFirestore } = await import("firebase/firestore");
  return _getFirestore(app);
}

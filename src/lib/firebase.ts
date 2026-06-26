// Firebase는 선택적. 키가 있을 때만 초기화한다(데모 모드에선 import만 하고 미사용).
import { hasFirebase, firebaseConfig } from "./env";

// 동적 초기화: 번들 부담을 줄이기 위해 호출 시점에 import.
export async function getFirebaseAuth() {
  if (!hasFirebase) return null;
  const { initializeApp, getApps } = await import("firebase/app");
  const { getAuth } = await import("firebase/auth");
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getAuth(app);
}

import type { DataProvider } from "./provider";
import { mockProvider } from "./mock";

// 현재는 항상 mock. 추후 Firebase 구현 추가 시:
//   import { firebaseProvider } from "./firebase";
//   export const db = hasFirebase ? firebaseProvider : mockProvider;
export const db: DataProvider = mockProvider;

export type { DataProvider, NearbyPartner } from "./provider";

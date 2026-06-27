// Phase 1 공종 + Phase 2 재능 분야 통합 카탈로그
import type { Category } from "@/types";
import { categories as facilityCategories } from "@/lib/demo-data";
import { talentCategories } from "./demo";

export const allCategories: Category[] = [...facilityCategories, ...talentCategories];

export function catName(id: string): string {
  return allCategories.find((c) => c.id === id)?.name ?? id;
}

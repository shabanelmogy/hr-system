import type { State } from "../../types/State";
import type { Theme } from "@mui/material/styles";
import { getQualityInfo, getQualityKey } from "@/shared/utils/quality";

export const getQualityScore = (state: State) => {
  let score = 40; // Base score
  if (state.nameEn) score += 20;
  if (state.nameAr) score += 20;
  if (state.code) score += 20;
  if (state.countryId && state.country) score += 10;
  return Math.min(score, 100);
};

/**
 * Backwards-compatible helper for StateCard.tsx that returns { level, color }.
 * Uses centralized thresholds and palette mapping.
 */
export const getQualityLevel = (score: number, theme: Theme) => {
  const info = getQualityInfo(score, theme);
  return { level: getQualityKey(score), color: info.color } as const;
};

import type { Theme } from "@mui/material/styles";
import type { District } from "../../types/District";
import { getQualityInfo, getQualityKey } from "@/shared/utils/quality";

export const getQualityScore = (district: District) => {
  let score = 50; // Base score
  if (district.nameEn) score += 20;
  if (district.nameAr) score += 20;
  if (district.code) score += 10;
  if (district.stateId) score += 10;
  return Math.min(score, 100);
};

/**
 * Returns { level, color } using centralized thresholds and palette mapping.
 * level is a key: "excellent" | "good" | "average" | "poor"
 */
export const getQualityLevel = (score: number, theme: Theme) => {
  const info = getQualityInfo(score, theme);
  return { level: getQualityKey(score), color: info.color } as const;
};
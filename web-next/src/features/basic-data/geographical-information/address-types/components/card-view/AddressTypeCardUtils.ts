import type { Theme } from "@mui/material/styles";
import type { AddressType } from "../../types/AddressType";
import { getQualityInfo, getQualityKey } from "@/shared/utils/quality";

export const getQualityScore = (addressType: AddressType) => {
  let score = 50; // Base score
  if (addressType.nameEn) score += 25;
  if (addressType.nameAr) score += 25;
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
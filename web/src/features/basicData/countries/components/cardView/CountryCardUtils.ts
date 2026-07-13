import type { Theme } from "@mui/material/styles";
import type { Country } from "../../types/Country";
import { getQualityInfo, getQualityKey } from "@/shared/utils/quality";

export const getQualityScore = (country: Country) => {
  let score = 50; // Base score
  if (country.nameEn) score += 15;
  if (country.nameAr) score += 15;
  if (country.alpha2Code) score += 5;
  if (country.alpha3Code) score += 5;
  if (country.phoneCode) score += 5;
  if (country.currencyCode) score += 5;
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

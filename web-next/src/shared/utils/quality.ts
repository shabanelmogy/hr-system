import type { Theme } from "@mui/material/styles";

export type QualityKey = "excellent" | "good" | "average" | "poor";

/**
 * Map a numeric score (0-100) to a qualitative level key.
 * Centralized thresholds to avoid duplication.
 */
export const getQualityKey = (score: number): QualityKey => {
  const s = Math.max(0, Math.min(100, score));
  if (s >= 90) return "excellent";
  if (s >= 75) return "good";
  if (s >= 60) return "average";
  return "poor";
};

/**
 * Resolve a color for a given quality key using the Theme palette.
 */
export const getQualityColor = (key: QualityKey, theme: Theme): string => {
  switch (key) {
    case "excellent":
      return theme.palette.success.main;
    case "good":
      return theme.palette.info.main;
    case "average":
      return theme.palette.warning.main;
    case "poor":
    default:
      return theme.palette.error.main;
  }
};

/**
 * Convenience helper that returns both the quality key and its color.
 */
export const getQualityInfo = (score: number, theme: Theme) => {
  const key = getQualityKey(score);
  const color = getQualityColor(key, theme);
  return { key, color } as const;
};

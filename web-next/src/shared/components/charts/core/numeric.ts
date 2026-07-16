export interface NumericExtent {
  min: number;
  max: number;
}

export const clamp = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
};

export const safePercentage = (value: number, min = 0, max = 100): number => {
  const range = max - min;
  if (!Number.isFinite(value) || !Number.isFinite(range) || range <= 0) return 0;
  return clamp(((value - min) / range) * 100, 0, 100);
};

export const normalizeValue = (value: number, min: number, max: number): number => {
  if (![value, min, max].every(Number.isFinite)) return 0;
  if (max <= min) return 0.5;
  return clamp((value - min) / (max - min), 0, 1);
};

export const getFiniteExtent = (values: readonly number[]): NumericExtent | null => {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;
};

export const getSafeScaleMax = (...values: readonly number[]): number => {
  let max = 1;
  for (const value of values) {
    if (Number.isFinite(value) && value > max) max = value;
  }
  return max;
};

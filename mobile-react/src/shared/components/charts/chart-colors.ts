import type { AppColors } from '@/src/core/theme';

const paletteKeys = ['primary', 'secondary', 'accent', 'success', 'warning'] as const;

export function getChartColor(
  colors: AppColors,
  index: number,
  preferredColor?: string,
): string {
  return preferredColor ?? colors[paletteKeys[index % paletteKeys.length]];
}

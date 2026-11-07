import type { DistrictListItem } from '../types/district';
export const districtName = (
  row: Pick<DistrictListItem, 'nameAr' | 'nameEn'>,
  language: string,
): string => (language.startsWith('ar') ? row.nameAr : row.nameEn);
export const districtNumber = (value: number, language: string): string =>
  new Intl.NumberFormat(language).format(value);
export const districtDate = (value: string | null, language: string): string =>
  value ? new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(value)) : '—';
export function districtQualityAppearance(row: DistrictListItem) {
  const quality = Math.min(
    100,
    40 +
      (row.nameEn ? 20 : 0) +
      (row.nameAr ? 20 : 0) +
      (row.code ? 20 : 0) +
      (row.stateId && row.state ? 10 : 0),
  );
  const tone =
    quality >= 90
      ? 'success'
      : quality >= 75
        ? 'primary'
        : quality >= 60
          ? 'warning'
          : 'destructive';
  const level =
    quality >= 90 ? 'excellent' : quality >= 75 ? 'good' : quality >= 60 ? 'average' : 'poor';
  return { quality, level, accent: `var(--${tone})`, contrast: `var(--${tone}-foreground)` };
}

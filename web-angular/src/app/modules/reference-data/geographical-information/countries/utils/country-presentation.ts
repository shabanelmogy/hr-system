import type { CountryListItem } from '../types/country';
import { countryQuality } from '../types/country';
import type { UiLanguage } from '../../../../../shared/localization/public-api';

export const countryName = (row: CountryListItem, language: UiLanguage): string =>
  language === 'ar' ? row.nameAr : row.nameEn;
export const countryOtherName = (row: CountryListItem, language: UiLanguage): string =>
  language === 'ar' ? row.nameEn : row.nameAr;
export const countryPhone = (value: string | null): string =>
  value ? '+' + value.replace(/^\+/, '') : '—';
export const countryNumber = (value: number, language: UiLanguage): string =>
  new Intl.NumberFormat(language).format(value);
export const countryDate = (value: string | null, language: UiLanguage): string =>
  value ? new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(value)) : '—';

/** Countries owns the score thresholds and semantic color mapping. */
export function countryQualityAppearance(row: CountryListItem) {
  const quality = countryQuality(row);
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

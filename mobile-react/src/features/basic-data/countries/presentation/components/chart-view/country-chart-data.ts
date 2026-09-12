import type { AppChartDatum } from '@/src/shared/components';
import type { Country } from '../../types/country';

const isArabicLanguage = (language: string): boolean => language.toLowerCase().startsWith('ar');

export function prepareCountryStatesData(
  countries: readonly Country[],
  language: string,
): AppChartDatum[] {
  const arabic = isArabicLanguage(language);
  return countries
    .map((country) => ({
      key: String(country.id),
      label: arabic ? country.nameAr : country.nameEn,
      value: country.statesCount,
    }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 10);
}

export function prepareCountryCurrencyData(countries: readonly Country[]): AppChartDatum[] {
  const currencies = new Map<string, number>();
  for (const country of countries) {
    const currency = country.currencyCode?.trim().toUpperCase();
    if (currency) currencies.set(currency, (currencies.get(currency) ?? 0) + 1);
  }

  return [...currencies.entries()]
    .map(([currency, value]) => ({ key: currency, label: currency, value }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 10);
}

export function prepareCountryCoverageData(
  countries: readonly Country[],
  labels: { withStates: string; withoutStates: string },
): AppChartDatum[] {
  const withStates = countries.filter((country) => country.statesCount > 0).length;
  return [
    { key: 'with-states', label: labels.withStates, value: withStates },
    { key: 'without-states', label: labels.withoutStates, value: countries.length - withStates },
  ];
}

export function prepareCountryTimelineData(
  countries: readonly Country[],
  language: string,
): AppChartDatum[] {
  const timeline = new Map<string, number>();
  for (const country of countries) {
    const date = new Date(country.createdOn);
    if (Number.isNaN(date.getTime())) continue;
    const key = date.toISOString().slice(0, 7);
    timeline.set(key, (timeline.get(key) ?? 0) + 1);
  }

  const formatter = new Intl.DateTimeFormat(language, {
    month: 'short',
    timeZone: 'UTC',
    year: '2-digit',
  });
  return [...timeline.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => ({
      key,
      label: formatter.format(new Date(`${key}-01T00:00:00Z`)),
      value,
    }));
}

export function getCountryChartSummary(countries: readonly Country[]) {
  return {
    currencies: new Set(countries.map((country) => country.currencyCode).filter(Boolean)).size,
    states: countries.reduce((total, country) => total + country.statesCount, 0),
  };
}

import type { AppChartDatum } from '@/src/shared/components';
import type { District } from '../../types/district';

const isArabicLanguage = (language: string): boolean => language.toLowerCase().startsWith('ar');

export function prepareDistrictStateData(
  districts: readonly District[],
  language: string,
): AppChartDatum[] {
  const arabic = isArabicLanguage(language);
  const states = new Map<number, AppChartDatum>();
  for (const district of districts) {
    const current = states.get(district.state.id);
    if (current) {
      current.value += 1;
      continue;
    }
    states.set(district.state.id, {
      key: String(district.state.id),
      label: arabic ? district.state.nameAr : district.state.nameEn,
      value: 1,
    });
  }

  return [...states.values()]
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 10);
}

export function prepareDistrictAddressData(
  districts: readonly District[],
  language: string,
): AppChartDatum[] {
  const arabic = isArabicLanguage(language);
  return districts
    .map((district) => ({
      key: String(district.id),
      label: arabic ? district.nameAr : district.nameEn,
      value: district.addressesCount,
    }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 10);
}

export function prepareDistrictAddressCoverageData(
  districts: readonly District[],
  labels: { withAddresses: string; withoutAddresses: string },
): AppChartDatum[] {
  const withAddresses = districts.filter((district) => district.addressesCount > 0).length;
  return [
    { key: 'with-addresses', label: labels.withAddresses, value: withAddresses },
    {
      key: 'without-addresses',
      label: labels.withoutAddresses,
      value: districts.length - withAddresses,
    },
  ];
}

export function prepareDistrictTimelineData(
  districts: readonly District[],
  language: string,
): AppChartDatum[] {
  const timeline = new Map<string, number>();
  for (const district of districts) {
    const date = new Date(district.createdOn);
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

export function getDistrictChartSummary(districts: readonly District[]) {
  return {
    states: new Set(districts.map((district) => district.state.id)).size,
    addresses: districts.reduce((total, district) => total + district.addressesCount, 0),
  };
}

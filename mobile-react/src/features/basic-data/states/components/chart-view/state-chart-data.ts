import type { AppChartDatum } from '@/src/shared/components';
import type { State } from '../../types/state';

const isArabicLanguage = (language: string): boolean => language.toLowerCase().startsWith('ar');

export function prepareStateCountryData(
  states: readonly State[],
  language: string,
): AppChartDatum[] {
  const arabic = isArabicLanguage(language);
  const countries = new Map<number, AppChartDatum>();
  for (const state of states) {
    const current = countries.get(state.country.id);
    if (current) {
      current.value += 1;
      continue;
    }
    countries.set(state.country.id, {
      key: String(state.country.id),
      label: arabic ? state.country.nameAr : state.country.nameEn,
      value: 1,
    });
  }

  return [...countries.values()]
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 10);
}

export function prepareStateDistrictData(
  states: readonly State[],
  language: string,
): AppChartDatum[] {
  const arabic = isArabicLanguage(language);
  return states
    .map((state) => ({
      key: String(state.id),
      label: arabic ? state.nameAr : state.nameEn,
      value: state.districtsCount,
    }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 10);
}

export function prepareStateDistrictCoverageData(
  states: readonly State[],
  labels: { withDistricts: string; withoutDistricts: string },
): AppChartDatum[] {
  const withDistricts = states.filter((state) => state.districtsCount > 0).length;
  return [
    { key: 'with-districts', label: labels.withDistricts, value: withDistricts },
    {
      key: 'without-districts',
      label: labels.withoutDistricts,
      value: states.length - withDistricts,
    },
  ];
}

export function prepareStateTimelineData(
  states: readonly State[],
  language: string,
): AppChartDatum[] {
  const timeline = new Map<string, number>();
  for (const state of states) {
    const date = new Date(state.createdOn);
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

export function getStateChartSummary(states: readonly State[]) {
  return {
    countries: new Set(states.map((state) => state.country.id)).size,
    districts: states.reduce((total, state) => total + state.districtsCount, 0),
  };
}

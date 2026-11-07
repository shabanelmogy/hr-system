import type { ChartDefinition, ChartMetric } from '../../../../../shared/ui/charts/public-api';
import type { StateListItem } from '../types/state';

/** Matching total is authoritative; chart samples deliberately cover the loaded page. */
export function stateChartData(
  rows: readonly StateListItem[],
  total: number,
  language: string,
  text: (key: string) => string,
): { metrics: readonly ChartMetric[]; plots: readonly ChartDefinition[] } {
  const arabic = language.toLowerCase().startsWith('ar');
  const countries = new Map<number, { name: string; count: number }>();
  const months = new Map<string, number>();
  let districts = 0;
  for (const row of rows) {
    const current = countries.get(row.countryId);
    countries.set(row.countryId, {
      name: arabic ? row.country.nameAr : row.country.nameEn,
      count: (current?.count ?? 0) + 1,
    });
    const date = new Date(row.createdOn);
    if (Number.isFinite(date.getTime())) {
      const month = date.toISOString().slice(0, 7);
      months.set(month, (months.get(month) ?? 0) + 1);
    }
    districts += row.districtsCount;
  }
  const parentData = [...countries.values()].sort((a, b) => b.count - a.count);
  const districtData = rows
    .filter((row) => row.districtsCount > 0)
    .map((row) => ({ name: arabic ? row.nameAr : row.nameEn, count: row.districtsCount }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const metrics: readonly ChartMetric[] = [
    {
      id: 'matching',
      label: text('states.dashboard.totalMatching'),
      value: String(total),
      icon: 'location',
      accent: 'var(--primary)',
    },
    {
      id: 'loaded',
      label: text('states.dashboard.visibleStates'),
      value: String(rows.length),
      icon: 'view',
      accent: 'var(--info)',
    },
    {
      id: 'countries',
      label: text('states.dashboard.countriesOnPage'),
      value: String(countries.size),
      icon: 'globe',
      accent: 'var(--brand-2)',
    },
    {
      id: 'districts',
      label: text('states.dashboard.districtsOnPage'),
      value: String(districts),
      icon: 'assessment',
      accent: 'var(--success)',
    },
  ];
  const scope = text('states.charts.pageScope');
  const plots: ChartDefinition[] = [
    {
      id: 'countries',
      title: text('states.charts.statesByCountry'),
      subtitle: scope,
      kind: 'bar',
      labels: parentData.map((item) => item.name),
      series: [
        { name: text('states.charts.totalStates'), values: parentData.map((item) => item.count) },
      ],
      legend: true,
      numberLocale: language,
    },
    {
      id: 'country-share',
      title: text('states.charts.countryShare'),
      subtitle: scope,
      kind: 'pie',
      labels: parentData.map((item) => item.name),
      series: [
        { name: text('states.charts.totalStates'), values: parentData.map((item) => item.count) },
      ],
      palette: 'rainbow',
      legend: true,
      sliceLabels: true,
      numberLocale: language,
    },
    {
      id: 'districts',
      title: text('states.charts.districtsByState'),
      subtitle: scope,
      kind: 'horizontal-bar',
      labels: districtData.map((item) => item.name),
      series: [{ name: text('states.districts'), values: districtData.map((item) => item.count) }],
      palette: 'secondary',
      numberLocale: language,
    },
  ];
  if (months.size) {
    let cumulative = 0;
    const timeline = [...months].sort((a, b) => a[0].localeCompare(b[0]));
    plots.push({
      id: 'timeline',
      title: text('states.charts.timeline'),
      subtitle: scope,
      kind: 'area',
      labels: timeline.map((item) => item[0]),
      series: [
        {
          name: text('states.charts.totalStates'),
          values: timeline.map((item) => (cumulative += item[1])),
        },
      ],
      palette: 'success',
      numberLocale: language,
    });
  }
  return { metrics, plots };
}

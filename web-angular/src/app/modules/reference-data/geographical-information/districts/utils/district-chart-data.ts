import type { ChartDefinition, ChartMetric } from '../../../../../shared/ui/charts/public-api';
import type { DistrictListItem } from '../types/district';

/** Matching total is authoritative; chart samples deliberately cover the loaded page. */
export function districtChartData(
  rows: readonly DistrictListItem[],
  total: number,
  language: string,
  text: (key: string) => string,
): { metrics: readonly ChartMetric[]; plots: readonly ChartDefinition[] } {
  const arabic = language.toLowerCase().startsWith('ar');
  const states = new Map<number, { name: string; count: number }>();
  const months = new Map<string, number>();
  let districts = 0;
  for (const row of rows) {
    const current = states.get(row.stateId);
    states.set(row.stateId, {
      name: arabic ? row.state.nameAr : row.state.nameEn,
      count: (current?.count ?? 0) + 1,
    });
    const date = new Date(row.createdOn);
    if (Number.isFinite(date.getTime())) {
      const month = date.toISOString().slice(0, 7);
      months.set(month, (months.get(month) ?? 0) + 1);
    }
    districts += row.addressesCount;
  }
  const parentData = [...states.values()].sort((a, b) => b.count - a.count);
  const districtData = rows
    .filter((row) => row.addressesCount > 0)
    .map((row) => ({ name: arabic ? row.nameAr : row.nameEn, count: row.addressesCount }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const metrics: readonly ChartMetric[] = [
    {
      id: 'matching',
      label: text('districts.dashboard.totalMatching'),
      value: String(total),
      icon: 'location',
      accent: 'var(--primary)',
    },
    {
      id: 'loaded',
      label: text('districts.dashboard.visibleDistricts'),
      value: String(rows.length),
      icon: 'view',
      accent: 'var(--info)',
    },
    {
      id: 'states',
      label: text('districts.dashboard.statesOnPage'),
      value: String(states.size),
      icon: 'globe',
      accent: 'var(--brand-2)',
    },
    {
      id: 'addresses',
      label: text('districts.dashboard.addressesOnPage'),
      value: String(districts),
      icon: 'assessment',
      accent: 'var(--success)',
    },
  ];
  const scope = text('districts.charts.pageScope');
  const plots: ChartDefinition[] = [
    {
      id: 'states',
      title: text('districts.charts.districtsByState'),
      subtitle: scope,
      kind: 'bar',
      labels: parentData.map((item) => item.name),
      series: [
        {
          name: text('districts.charts.totalDistricts'),
          values: parentData.map((item) => item.count),
        },
      ],
      legend: true,
      numberLocale: language,
    },
    {
      id: 'state-share',
      title: text('districts.charts.stateShare'),
      subtitle: scope,
      kind: 'pie',
      labels: parentData.map((item) => item.name),
      series: [
        {
          name: text('districts.charts.totalDistricts'),
          values: parentData.map((item) => item.count),
        },
      ],
      palette: 'rainbow',
      legend: true,
      sliceLabels: true,
      numberLocale: language,
    },
    {
      id: 'addresses',
      title: text('districts.charts.addressesByDistrict'),
      subtitle: scope,
      kind: 'horizontal-bar',
      labels: districtData.map((item) => item.name),
      series: [
        { name: text('districts.addresses'), values: districtData.map((item) => item.count) },
      ],
      palette: 'secondary',
      numberLocale: language,
    },
  ];
  if (months.size) {
    let cumulative = 0;
    const timeline = [...months].sort((a, b) => a[0].localeCompare(b[0]));
    plots.push({
      id: 'timeline',
      title: text('districts.charts.timeline'),
      subtitle: scope,
      kind: 'area',
      labels: timeline.map((item) => item[0]),
      series: [
        {
          name: text('districts.charts.totalDistricts'),
          values: timeline.map((item) => (cumulative += item[1])),
        },
      ],
      palette: 'success',
      numberLocale: language,
    });
  }
  return { metrics, plots };
}

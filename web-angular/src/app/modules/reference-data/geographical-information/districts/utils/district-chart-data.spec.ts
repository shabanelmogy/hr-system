import { districtFixture } from '../district.fixture';
import { districtChartData } from './district-chart-data';

describe('District page-scoped analytics', () => {
  it('groups distinct State IDs, keeps server total separate and computes only loaded District counts', () => {
    const rows = [
      districtFixture,
      {
        ...districtFixture,
        id: 2,
        nameEn: 'Giza',
        createdOn: '2026-02-01T00:00:00Z',
        addressesCount: 2,
      },
      {
        ...districtFixture,
        id: 3,
        stateId: 2,
        state: { ...districtFixture.state, id: 2 },
        addressesCount: 0,
      },
    ];
    const analytics = districtChartData(rows, 120, 'en', (key) => key);
    expect(analytics.metrics.map((metric) => metric.value)).toEqual(['120', '3', '2', '6']);
    expect(analytics.plots.find((plot) => plot.id === 'states')?.series[0]?.values).toEqual([2, 1]);
    expect(analytics.plots.find((plot) => plot.id === 'addresses')?.labels).toEqual([
      'Cairo',
      'Giza',
    ]);
    expect(analytics.plots.find((plot) => plot.id === 'timeline')?.series[0]?.values).toEqual([
      2, 3,
    ]);
    expect(rows[0]).toBe(districtFixture);
  });
  it('localizes captions and gives empty samples no fabricated plot values', () => {
    const localized = districtChartData([districtFixture], 1, 'ar', (key) => key);
    expect(localized.plots.find((plot) => plot.id === 'states')?.labels).toEqual(['مصر']);
    const empty = districtChartData([], 100, 'en', (key) => key);
    expect(empty.metrics.map((metric) => metric.value)).toEqual(['100', '0', '0', '0']);
    expect(empty.plots.every((plot) => plot.labels.length === 0)).toBe(true);
  });
});

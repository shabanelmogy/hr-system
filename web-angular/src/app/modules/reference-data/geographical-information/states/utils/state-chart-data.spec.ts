import { stateFixture } from '../state.fixture';
import { stateChartData } from './state-chart-data';

describe('State page-scoped analytics', () => {
  it('groups distinct Country IDs, keeps server total separate and computes only loaded District counts', () => {
    const rows = [
      stateFixture,
      {
        ...stateFixture,
        id: 2,
        nameEn: 'Giza',
        createdOn: '2026-02-01T00:00:00Z',
        districtsCount: 2,
      },
      {
        ...stateFixture,
        id: 3,
        countryId: 2,
        country: { ...stateFixture.country, id: 2 },
        districtsCount: 0,
      },
    ];
    const analytics = stateChartData(rows, 120, 'en', (key) => key);
    expect(analytics.metrics.map((metric) => metric.value)).toEqual(['120', '3', '2', '6']);
    expect(analytics.plots.find((plot) => plot.id === 'countries')?.series[0]?.values).toEqual([
      2, 1,
    ]);
    expect(analytics.plots.find((plot) => plot.id === 'districts')?.labels).toEqual([
      'Cairo',
      'Giza',
    ]);
    expect(analytics.plots.find((plot) => plot.id === 'timeline')?.series[0]?.values).toEqual([
      2, 3,
    ]);
    expect(rows[0]).toBe(stateFixture);
  });
  it('localizes captions and gives empty samples no fabricated plot values', () => {
    const localized = stateChartData([stateFixture], 1, 'ar', (key) => key);
    expect(localized.plots.find((plot) => plot.id === 'countries')?.labels).toEqual(['مصر']);
    const empty = stateChartData([], 100, 'en', (key) => key);
    expect(empty.metrics.map((metric) => metric.value)).toEqual(['100', '0', '0', '0']);
    expect(empty.plots.every((plot) => plot.labels.length === 0)).toBe(true);
  });
});

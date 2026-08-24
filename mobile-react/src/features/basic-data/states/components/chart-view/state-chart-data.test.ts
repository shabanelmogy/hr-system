import type { State } from '../../types/state';
import {
  getStateChartSummary,
  prepareStateCountryData,
  prepareStateDistrictCoverageData,
  prepareStateDistrictData,
  prepareStateTimelineData,
} from './state-chart-data';

const egypt = { id: 1, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false };
const jordan = { id: 2, nameAr: 'الأردن', nameEn: 'Jordan', isDeleted: false };
const states: State[] = [
  { id: 1, nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 1, country: egypt, districtsCount: 4, createdOn: '2026-07-01T00:00:00Z', updatedOn: null, isDeleted: false },
  { id: 2, nameAr: 'الجيزة', nameEn: 'Giza', code: 'GIZ', countryId: 1, country: egypt, districtsCount: 2, createdOn: '2026-08-01T00:00:00Z', updatedOn: null, isDeleted: false },
  { id: 3, nameAr: 'عمان', nameEn: 'Amman', code: 'AMM', countryId: 2, country: jordan, districtsCount: 0, createdOn: 'invalid', updatedOn: null, isDeleted: false },
];

describe('state chart data', () => {
  it('creates localized current-page country, district, and timeline series', () => {
    expect(prepareStateCountryData(states, 'en')).toEqual([
      { key: '1', label: 'Egypt', value: 2 },
      { key: '2', label: 'Jordan', value: 1 },
    ]);
    expect(prepareStateDistrictData(states, 'ar')[0]).toMatchObject({ label: 'القاهرة', value: 4 });
    expect(prepareStateDistrictCoverageData(states, {
      withDistricts: 'With',
      withoutDistricts: 'Without',
    })).toEqual([
      { key: 'with-districts', label: 'With', value: 2 },
      { key: 'without-districts', label: 'Without', value: 1 },
    ]);
    expect(prepareStateTimelineData(states, 'en')).toHaveLength(2);
    expect(getStateChartSummary(states)).toEqual({ countries: 2, districts: 6 });
  });
});

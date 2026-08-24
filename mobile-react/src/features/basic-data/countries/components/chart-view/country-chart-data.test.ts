import type { Country } from '../../types/country';
import {
  getCountryChartSummary,
  prepareCountryCoverageData,
  prepareCountryCurrencyData,
  prepareCountryStatesData,
  prepareCountryTimelineData,
} from './country-chart-data';

const countries: Country[] = [
  { id: 1, nameAr: 'مصر', nameEn: 'Egypt', alpha2Code: 'EG', alpha3Code: 'EGY', phoneCode: '+20', currencyCode: 'EGP', statesCount: 3, createdOn: '2026-07-01T00:00:00Z', updatedOn: null, isDeleted: false },
  { id: 2, nameAr: 'الأردن', nameEn: 'Jordan', alpha2Code: 'JO', alpha3Code: 'JOR', phoneCode: '+962', currencyCode: 'JOD', statesCount: 1, createdOn: '2026-08-01T00:00:00Z', updatedOn: null, isDeleted: false },
  { id: 3, nameAr: 'أخرى', nameEn: 'Other', alpha2Code: null, alpha3Code: null, phoneCode: null, currencyCode: 'EGP', statesCount: 0, createdOn: 'invalid', updatedOn: null, isDeleted: false },
];

describe('country chart data', () => {
  it('creates localized and deterministically sorted page-scoped series', () => {
    expect(prepareCountryStatesData(countries, 'ar')[0]).toMatchObject({ label: 'مصر', value: 3 });
    expect(prepareCountryCurrencyData(countries)).toEqual([
      { key: 'EGP', label: 'EGP', value: 2 },
      { key: 'JOD', label: 'JOD', value: 1 },
    ]);
    expect(prepareCountryCoverageData(countries, { withStates: 'With', withoutStates: 'Without' }))
      .toEqual([
        { key: 'with-states', label: 'With', value: 2 },
        { key: 'without-states', label: 'Without', value: 1 },
      ]);
    expect(prepareCountryTimelineData(countries, 'en')).toHaveLength(2);
    expect(getCountryChartSummary(countries)).toEqual({ currencies: 2, states: 4 });
  });
});

import type { CompanyCountryOption } from '../types/company-geographic-scope';
import {
  clearUnselectedDefaultCountry,
  filterCompanyCountries,
  normalizeCompanyCountryIds,
} from './company-geographic-scope-grid';

const countries: CompanyCountryOption[] = [
  {
    id: 1,
    nameAr: 'مصر',
    nameEn: 'Egypt',
    alpha2Code: 'EG',
    alpha3Code: 'EGY',
    isSelected: true,
    isDefault: true,
  },
  {
    id: 2,
    nameAr: 'السعودية',
    nameEn: 'Saudi Arabia',
    alpha2Code: 'SA',
    alpha3Code: 'SAU',
    isSelected: false,
    isDefault: false,
  },
];

describe('company geographic scope grid', () => {
  it('searches the complete aggregate by localized names and ISO codes', () => {
    expect(filterCompanyCountries(countries, 'مصر').map(({ id }) => id)).toEqual([1]);
    expect(filterCompanyCountries(countries, 'sau').map(({ id }) => id)).toEqual([2]);
    expect(filterCompanyCountries(countries, '  ')).toHaveLength(2);
  });

  it('normalizes selected table keys to distinct positive country ids', () => {
    expect(normalizeCompanyCountryIds(['2', 1, 0, 'invalid', 2])).toEqual([2, 1]);
  });

  it('clears the default when it is no longer an operating country', () => {
    expect(clearUnselectedDefaultCountry([1], 2)).toBe(0);
    expect(clearUnselectedDefaultCountry([1, 2], 2)).toBe(2);
  });
});

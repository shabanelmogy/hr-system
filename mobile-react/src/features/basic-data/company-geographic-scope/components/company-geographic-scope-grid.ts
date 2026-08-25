import type { AppDataTableRowKey } from '@/src/shared/components';
import type { CompanyCountryOption } from '../types/company-geographic-scope';

export function filterCompanyCountries(
  countries: readonly CompanyCountryOption[],
  searchTerm: string,
) {
  const normalizedSearch = normalizeSearchValue(searchTerm);
  if (!normalizedSearch) return [...countries];

  return countries.filter((country) =>
    [country.nameAr, country.nameEn, country.alpha2Code, country.alpha3Code]
      .some((value) => normalizeSearchValue(value).includes(normalizedSearch)),
  );
}

export function normalizeCompanyCountryIds(ids: readonly AppDataTableRowKey[]) {
  const normalizedIds = new Set<number>();

  for (const id of ids) {
    const numericId = Number(id);
    if (Number.isInteger(numericId) && numericId > 0) {
      normalizedIds.add(numericId);
    }
  }

  return [...normalizedIds];
}

export function clearUnselectedDefaultCountry(
  selectedCountryIds: readonly number[],
  defaultCountryId: number,
) {
  return defaultCountryId > 0 && selectedCountryIds.includes(defaultCountryId)
    ? defaultCountryId
    : 0;
}

function normalizeSearchValue(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase() ?? '';
}

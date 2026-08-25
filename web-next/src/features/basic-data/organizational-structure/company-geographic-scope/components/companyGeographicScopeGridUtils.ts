import type { CompanyCountryOption } from "../types/CompanyGeographicScope";

export function filterCompanyCountries(
  countries: readonly CompanyCountryOption[],
  searchTerm: string,
) {
  const normalizedSearch = normalizeSearchValue(searchTerm);
  if (!normalizedSearch) return [...countries];

  return countries.filter((country) =>
    [
      country.nameAr,
      country.nameEn,
      country.alpha2Code,
      country.alpha3Code,
    ].some((value) => normalizeSearchValue(value).includes(normalizedSearch)),
  );
}

export function normalizeCompanyCountryIds(ids: Iterable<unknown>) {
  const normalizedIds = new Set<number>();

  for (const id of ids) {
    const numericId = Number(id);
    if (Number.isInteger(numericId) && numericId > 0) {
      normalizedIds.add(numericId);
    }
  }

  return [...normalizedIds];
}

export function ensureCountrySelected(
  selectedCountryIds: readonly number[],
  countryId: number,
) {
  return selectedCountryIds.includes(countryId)
    ? [...selectedCountryIds]
    : [...selectedCountryIds, countryId];
}

function normalizeSearchValue(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase() ?? "";
}

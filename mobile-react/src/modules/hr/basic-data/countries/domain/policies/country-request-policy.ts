import type { CountryRequest } from '../models/country';

function normalizeNullable(value: string | null): string | null {
  if (value == null) return null;
  return value.trim() || null;
}

export function normalizeCountryRequest(request: CountryRequest): CountryRequest {
  return {
    nameAr: request.nameAr.trim(),
    nameEn: request.nameEn.trim(),
    alpha2Code: normalizeNullable(request.alpha2Code)?.toUpperCase() ?? null,
    alpha3Code: normalizeNullable(request.alpha3Code)?.toUpperCase() ?? null,
    phoneCode: normalizeNullable(request.phoneCode),
    currencyCode: normalizeNullable(request.currencyCode)?.toUpperCase() ?? null,
  };
}

export function normalizeCountryRequests(
  requests: readonly CountryRequest[],
): CountryRequest[] {
  return requests.map(normalizeCountryRequest);
}

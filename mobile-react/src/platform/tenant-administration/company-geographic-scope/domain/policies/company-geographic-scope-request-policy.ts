import type { CompanyGeographicScopeRequest } from '../models/company-geographic-scope';

export function normalizeCompanyGeographicScopeRequest(
  request: CompanyGeographicScopeRequest,
): CompanyGeographicScopeRequest {
  const countryIds = [...new Set(request.countryIds.filter((id) => Number.isInteger(id) && id > 0))];
  return {
    countryIds,
    registrationCountryId: Number(request.registrationCountryId),
    defaultCountryId: Number(request.defaultCountryId),
  };
}

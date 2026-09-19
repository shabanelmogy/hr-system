import { normalizeCompanyGeographicScopeRequest } from './company-geographic-scope-request-policy';

describe('company geographic scope request policy', () => {
  it('deduplicates positive country ids and normalizes scalar ids', () => {
    expect(normalizeCompanyGeographicScopeRequest({
      countryIds: [2, 1, 2, 0, -1],
      registrationCountryId: 2,
      defaultCountryId: 1,
    })).toEqual({
      countryIds: [2, 1],
      registrationCountryId: 2,
      defaultCountryId: 1,
    });
  });
});

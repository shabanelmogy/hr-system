export const stateEndpoints = {
  base: 'states',
  lookup: (countryId?: number) => countryId == null ? 'states/lookup' : `states/lookup?countryId=${countryId}`,
  byCountry: (countryId: number) => `states/by-country/${countryId}`,
  byId: (id: number) => `states/${id}`,
  withDistricts: (id: number) => `states/${id}/districts`,
  restore: (id: number) => `states/${id}/restore`,
  bulkArchive: 'states/bulk-archive',
} as const;

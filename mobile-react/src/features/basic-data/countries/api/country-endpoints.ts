export const countryEndpoints = {
  base: 'countries',
  lookup: 'countries/lookup',
  byId: (id: number) => `countries/${id}`,
  withStates: (id: number) => `countries/${id}/states`,
  restore: (id: number) => `countries/${id}/restore`,
  bulkArchive: 'countries/bulk-archive',
} as const;

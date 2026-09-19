import type { CountryPageQuery } from '../../domain/models/country';

export type CountryReadMode = 'online-required' | 'offline-read';

export const countryKeys = {
  all: ['countries'] as const,
  lists: () => [...countryKeys.all, 'list'] as const,
  list: (query: CountryPageQuery, mode: CountryReadMode = 'online-required') =>
    [...countryKeys.lists(), mode, query] as const,
  lookup: (mode: CountryReadMode = 'online-required') => [...countryKeys.all, 'lookup', mode] as const,
  reportCatalog: () => [...countryKeys.all, 'reports', 'catalog'] as const,
};

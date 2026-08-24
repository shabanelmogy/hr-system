import type { CountryPageQuery } from '../types/country';

export const countryKeys = {
  all: ['countries'] as const,
  lists: () => [...countryKeys.all, 'list'] as const,
  list: (query: CountryPageQuery) => [...countryKeys.lists(), query] as const,
  lookup: () => [...countryKeys.all, 'lookup'] as const,
  reportCatalog: () => [...countryKeys.all, 'reports', 'catalog'] as const,
};

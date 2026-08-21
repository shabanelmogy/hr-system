import type { StatePageQuery } from '../types/state';
export const stateKeys = {
  all: ['states'] as const,
  lists: () => [...stateKeys.all, 'list'] as const,
  list: (query: StatePageQuery) => [...stateKeys.lists(), query] as const,
  lookup: (countryId?: number) => [...stateKeys.all, 'lookup', countryId ?? 'all'] as const,
  detail: (id: number) => [...stateKeys.all, 'detail', id] as const,
  withDistricts: (id: number) => [...stateKeys.all, 'districts', id] as const,
};

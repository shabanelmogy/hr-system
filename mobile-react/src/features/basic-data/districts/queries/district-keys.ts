import type { DistrictPageQuery } from '../types/district';
export const districtKeys = {
  all: ['districts'] as const,
  lists: () => [...districtKeys.all, 'list'] as const,
  list: (query: DistrictPageQuery) => [...districtKeys.lists(), query] as const,
  lookup: (stateId?: number) => [...districtKeys.all, 'lookup', stateId ?? 'all'] as const,
  withAddresses: (id: number) => [...districtKeys.all, 'addresses', id] as const,
  reportCatalog: () => [...districtKeys.all, 'reports', 'catalog'] as const,
};

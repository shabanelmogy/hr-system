import type { OrganizationalResource, OrganizationalStructureQuery } from '../types/organizational-structure';
export const organizationalStructureKeys = {
  all: ['organizational-structure'] as const,
  list: (query: OrganizationalStructureQuery) => [...organizationalStructureKeys.all, 'list', query] as const,
  lookup: (resource: OrganizationalResource, parentId?: number) => [...organizationalStructureKeys.all, 'lookup', resource, parentId ?? 'all'] as const,
  changeLogs: (resource: OrganizationalResource, id: number) => [...organizationalStructureKeys.all, 'change-logs', resource, id] as const,
};

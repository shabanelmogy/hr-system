import type {
  OrganizationalResource,
  OrganizationalStructureQuery,
} from '../../domain/models/organizational-structure';
export const organizationalStructureKeys = {
  all: ['organizational-structure'] as const,
  list: (query: OrganizationalStructureQuery) => [...organizationalStructureKeys.all, 'list', query] as const,
  lookup: (resource: OrganizationalResource, parentId?: number) => [...organizationalStructureKeys.all, 'lookup', resource, parentId ?? 'all'] as const,
};

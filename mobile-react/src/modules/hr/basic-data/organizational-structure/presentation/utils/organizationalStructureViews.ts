import type { OrganizationalResource } from '../../domain/models/organizational-structure';

export function getOrganizationalDefaultView(resource: OrganizationalResource): 'table' | 'tree' {
  return resource === 'cost-centers' ? 'tree' : 'table';
}

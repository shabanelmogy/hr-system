import { administrationKeys } from '@/src/features/administration/hooks/useAdministration';
import { tenantAdminKeys } from '@/src/features/tenant-admins/hooks/useTenantAdmins';
import { tenantKeys } from '@/src/features/tenants/hooks/useTenants';
import { platformToolKeys } from '@/src/features/platform-tools/hooks/usePlatformTools';

type QueryKey = readonly unknown[];

const administrationQueryKeys: readonly QueryKey[] = [
  administrationKeys.users,
  administrationKeys.companyOptions,
  administrationKeys.roles,
];

const queryKeysByResource: Readonly<Record<string, readonly QueryKey[]>> = {
  tenants: [tenantKeys.all],
  users: [administrationKeys.users, tenantAdminKeys.all, ['auth', 'current-user-photo']],
  roles: [administrationKeys.roles],
  'role-claims': [administrationKeys.roles],
  companies: [administrationKeys.companyOptions],
  countries: [],
  states: [],
  districts: [],
  'address-types': [],
  addresses: [],
  appointments: [],
  notifications: [['notifications']],
  'entity-change-logs': [platformToolKeys.trackChanges],
};

export function getRealtimeQueryKeys(resource: string): readonly QueryKey[] {
  return queryKeysByResource[resource] ?? [];
}

export function isKnownRealtimeResource(resource: string): boolean {
  return Object.hasOwn(queryKeysByResource, resource);
}

export function getAllRealtimeQueryKeys(): readonly QueryKey[] {
  const keys = new Map<string, QueryKey>();
  [
    tenantKeys.all,
    tenantAdminKeys.all,
    ['auth', 'current-user-photo'],
    ['notifications'],
    platformToolKeys.trackChanges,
    ...administrationQueryKeys,
  ].forEach((queryKey) => {
    keys.set(JSON.stringify(queryKey), queryKey);
  });
  return [...keys.values()];
}

export function resourceAffectsSession(resource: string): boolean {
  return ['tenants', 'users', 'roles', 'role-claims', 'companies'].includes(resource);
}

import { administrationKeys } from '@/src/features/administration/hooks/useAdministration';
import { tenantKeys } from '@/src/features/tenants/hooks/useTenants';

type QueryKey = readonly unknown[];

const administrationQueryKeys: readonly QueryKey[] = [
  administrationKeys.users,
  administrationKeys.companyOptions,
  administrationKeys.roles,
];

const queryKeysByResource: Readonly<Record<string, readonly QueryKey[]>> = {
  tenants: [tenantKeys.all],
  users: [administrationKeys.users, ['auth', 'current-user-photo']],
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
    ['auth', 'current-user-photo'],
    ['notifications'],
    ...administrationQueryKeys,
  ].forEach((queryKey) => {
    keys.set(JSON.stringify(queryKey), queryKey);
  });
  return [...keys.values()];
}

export function resourceAffectsSession(resource: string): boolean {
  return ['tenants', 'users', 'roles', 'role-claims', 'companies'].includes(resource);
}

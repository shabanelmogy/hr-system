type QueryKey = readonly unknown[];

// Stable public prefixes; realtime must not depend on feature hook implementations.
const queryKeys = {
  tenants: ['tenants'],
  users: ['administration', 'users'],
  companyOptions: ['administration', 'company-options'],
  roles: ['administration', 'roles'],
  tenantAdmins: ['tenant-admins'],
  appointments: ['platform-tools', 'appointments'],
  trackChanges: ['platform-tools', 'track-changes'],
  notifications: ['notifications'],
  profile: ['current-user-profile'],
  countries: ['countries'],
  states: ['states'],
  districts: ['districts'],
  addressTypes: ['address-types'],
  organizationalStructure: ['organizational-structure'],
  fiscalYears: ['fiscal-years'],
} as const satisfies Record<string, QueryKey>;

const administrationQueryKeys: readonly QueryKey[] = [
  queryKeys.users,
  queryKeys.companyOptions,
  queryKeys.roles,
];

const queryKeysByResource: Readonly<Record<string, readonly QueryKey[]>> = {
  tenants: [queryKeys.tenants],
  users: [queryKeys.users, queryKeys.tenantAdmins, queryKeys.profile],
  roles: [queryKeys.roles],
  'role-claims': [queryKeys.roles],
  companies: [queryKeys.companyOptions],
  appointments: [queryKeys.appointments],
  notifications: [queryKeys.notifications],
  'entity-change-logs': [queryKeys.trackChanges],
  countries: [queryKeys.countries],
  states: [queryKeys.states],
  districts: [queryKeys.districts],
  'address-types': [queryKeys.addressTypes],
  'organizational-structure': [queryKeys.organizationalStructure],
  'fiscal-years': [queryKeys.fiscalYears],
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
    queryKeys.tenants,
    queryKeys.tenantAdmins,
    queryKeys.profile,
    queryKeys.notifications,
    queryKeys.appointments,
    queryKeys.trackChanges,
    queryKeys.countries,
    queryKeys.states,
    queryKeys.districts,
    queryKeys.addressTypes,
    queryKeys.organizationalStructure,
    queryKeys.fiscalYears,
    ...administrationQueryKeys,
  ].forEach((queryKey) => {
    keys.set(JSON.stringify(queryKey), queryKey);
  });
  return [...keys.values()];
}

export function resourceAffectsSession(resource: string): boolean {
  return ['tenants', 'users', 'roles', 'role-claims', 'companies'].includes(resource);
}

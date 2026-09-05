import { appointmentKeys } from "@/features/appointments";
import { tenantAdminKeys } from "@/features/tenant-admins";
import { tenantKeys } from "@/features/tenants";
import { addressTypeKeys } from "@/features/basic-data/geographical-information/address-types";
import { countryKeys } from "@/features/basic-data/geographical-information/countries";
import { fiscalYearKeys } from "@/features/finance/fiscal-years";
import { districtKeys } from "@/features/basic-data/geographical-information/districts";
import { stateKeys } from "@/features/basic-data/geographical-information/states";
import { organizationalStructureKeys } from "@/features/basic-data/organizational-structure/management";

type QueryKey = readonly unknown[];

export const realtimeResources = {
  countries: "countries",
  fiscalYears: "fiscal-years",
  states: "states",
  organizationalStructure: "organizational-structure",
  districts: "districts",
  addressTypes: "address-types",
  addresses: "addresses",
  users: "users",
  appointments: "appointments",
  tenants: "tenants",
  roles: "roles",
  roleClaims: "role-claims",
  companies: "companies",
  notifications: "notifications",
  entityChangeLogs: "entity-change-logs",
} as const;

const queryKeysByResource: Readonly<Record<string, readonly QueryKey[]>> = {
  [realtimeResources.countries]: [countryKeys.all, stateKeys.all],
  [realtimeResources.fiscalYears]: [fiscalYearKeys.all],
  [realtimeResources.states]: [stateKeys.all, countryKeys.all, districtKeys.all],
  [realtimeResources.organizationalStructure]: [organizationalStructureKeys.all],
  [realtimeResources.districts]: [districtKeys.all, stateKeys.all],
  [realtimeResources.addressTypes]: [addressTypeKeys.all],
  [realtimeResources.addresses]: [],
  [realtimeResources.users]: [["userProfile"], tenantAdminKeys.all],
  [realtimeResources.appointments]: [appointmentKeys.all],
  [realtimeResources.tenants]: [tenantKeys.all],
  [realtimeResources.roles]: [],
  [realtimeResources.roleClaims]: [],
  [realtimeResources.companies]: [],
  [realtimeResources.notifications]: [["notifications"]],
  [realtimeResources.entityChangeLogs]: [["advancedTools", "trackChanges"]],
};

export function getRealtimeQueryKeys(resource: string): readonly QueryKey[] {
  return queryKeysByResource[resource] ?? [];
}

export function isKnownRealtimeResource(resource: string): boolean {
  return Object.hasOwn(queryKeysByResource, resource);
}

export function getAllRealtimeQueryKeys(): readonly QueryKey[] {
  const keys = new Map<string, QueryKey>();

  Object.values(queryKeysByResource).flat().forEach((queryKey) => {
    keys.set(JSON.stringify(queryKey), queryKey);
  });

  return [...keys.values()];
}

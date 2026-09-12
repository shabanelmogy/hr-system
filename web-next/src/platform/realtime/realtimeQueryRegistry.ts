import { tenantAdminKeys } from "@/platform/tenant-admins";
import { tenantKeys } from "@/platform/tenants";

export type RealtimeQueryKey = readonly unknown[];

export const realtimeResources = {
  users: "users",
  tenants: "tenants",
  roles: "roles",
  roleClaims: "role-claims",
  companies: "companies",
  notifications: "notifications",
  entityChangeLogs: "entity-change-logs",
} as const;

const queryKeysByResource = new Map<string, readonly RealtimeQueryKey[]>([
  [realtimeResources.users, [["userProfile"], tenantAdminKeys.all]],
  [realtimeResources.tenants, [tenantKeys.all]],
  [realtimeResources.roles, []],
  [realtimeResources.roleClaims, []],
  [realtimeResources.companies, []],
  [realtimeResources.notifications, [["notifications"]]],
  [realtimeResources.entityChangeLogs, [["advancedTools", "trackChanges"]]],
]);

export function registerRealtimeQueryKeys(
  registrations: Readonly<Record<string, readonly RealtimeQueryKey[]>>,
) {
  for (const [resource, keys] of Object.entries(registrations)) {
    queryKeysByResource.set(resource, keys);
  }
}

export function getRealtimeQueryKeys(resource: string): readonly RealtimeQueryKey[] {
  return queryKeysByResource.get(resource) ?? [];
}

export function isKnownRealtimeResource(resource: string): boolean {
  return queryKeysByResource.has(resource);
}

export function getAllRealtimeQueryKeys(): readonly RealtimeQueryKey[] {
  const keys = new Map<string, RealtimeQueryKey>();

  [...queryKeysByResource.values()].flat().forEach((queryKey) => {
    keys.set(JSON.stringify(queryKey), queryKey);
  });

  return [...keys.values()];
}

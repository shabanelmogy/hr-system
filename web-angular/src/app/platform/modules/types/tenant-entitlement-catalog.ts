import { parseModuleCatalog } from './module-contracts';

/** A super-admin catalog of module/submodule codes assignable to a Tenant. */
export interface TenantEntitlementModule {
  readonly code: string;
  readonly name: string;
  readonly isDefault: boolean;
  readonly submodules: readonly TenantEntitlementSubmodule[];
}

export interface TenantEntitlementSubmodule {
  readonly code: string;
  readonly name: string;
  readonly requiredPermissions: readonly string[];
  readonly entryPath: string | null;
}

export function parseTenantEntitlementCatalog(value: unknown): readonly TenantEntitlementModule[] {
  return parseModuleCatalog(value);
}

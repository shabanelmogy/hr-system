import { version } from "./constants";

export const modules = {
  installed: `${version}/modules/installed`,
  tenantEntitlements: `${version}/modules/tenant-entitlements`,
  accessible: `${version}/modules/accessible`,
} as const;

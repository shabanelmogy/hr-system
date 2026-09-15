"use client";

import { useMemo } from "react";

import { useSession } from "@/lib/auth/SessionContext";
import { useAccessibleModulesQuery } from "@/platform/modules";
import { getNavigationConfig } from "@/shell/components/sidebar/navigationConfig";
import { filterNavigationConfigByModules } from "@/shell/components/sidebar/navigationUtils";

export function useAuthorizedNavigation(activeModuleCode?: string | null) {
  const { user } = useSession();
  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === "super_admin",
  ) ?? false;
  const hasTenantContext = Boolean(user?.tenantId?.trim());
  const modulesQuery = useAccessibleModulesQuery(
    Boolean(user) && hasTenantContext && !isSuperAdmin,
  );

  const navigation = useMemo(() => {
    const permissionFiltered = getNavigationConfig(
      user?.roles,
      user?.permissions,
      activeModuleCode,
    );
    return filterNavigationConfigByModules(
      permissionFiltered,
      modulesQuery.data ?? [],
    );
  }, [activeModuleCode, modulesQuery.data, user?.permissions, user?.roles]);

  return { navigation, modulesQuery };
}

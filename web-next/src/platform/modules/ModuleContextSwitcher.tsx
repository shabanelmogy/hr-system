"use client";

import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { appRoutes } from "@/config/routes";
import { useSession } from "@/lib/auth/SessionContext";
import { requiredModuleForPath } from "./routeRequirements";
import { ContextSwitcher, type ContextSwitcherItem } from "@/shared/components/layout";
import { toLauncherModule } from "./modulePresentation";
import { useAccessibleModulesQuery } from "./useModulesQuery";
import type { ErpModule } from "./types";

const overviewValue = "__overview";

/** Application-level context switcher for the authenticated tenant toolbar. */
export function ModuleContextSwitcher({ iconOnly = false }: { iconOnly?: boolean }) {
  const { t } = useTranslation();
  const { user } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { requestDiscard } = useUnsavedChanges();
  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === "super_admin",
  ) ?? false;
  const hasTenantContext = Boolean(user?.tenantId?.trim());
  const modulesQuery = useAccessibleModulesQuery(Boolean(user) && hasTenantContext && !isSuperAdmin);
  const modules = useMemo(() => modulesQuery.data ?? [], [modulesQuery.data]);
  const activeRequirement = requiredModuleForPath(pathname);
  const activeModuleCode = activeRequirement?.moduleCode.toLowerCase();
  const activeModule = modules.find(
    (module) => module.code.toLowerCase() === activeModuleCode,
  );

  const items = useMemo<ContextSwitcherItem<string>[]>(() => [
    {
      value: overviewValue,
      label: t("modules.overview"),
      secondaryLabel: t("modules.title"),
      icon: <AppsRoundedIcon />,
    },
    ...modules.map((module) => {
      const presentation = toLauncherModule(module);
      return {
        value: module.code,
        label: moduleName(module, t),
        icon: presentation.icon,
      };
    }),
  ], [modules, t]);

  const selectedValue = activeModule?.code ?? overviewValue;

  if (!user || isSuperAdmin || !hasTenantContext) return null;

  const handleChange = async (value: string) => {
    if (!(await requestDiscard())) return;
    const destination = value === overviewValue
      ? appRoutes.platform.apps.index
      : appRoutes.platform.apps.module(value);
    router.push(destination);
  };

  return (
    <ContextSwitcher<string>
      items={items}
      value={selectedValue}
      onChange={handleChange}
      label={t("modules.currentApplication")}
      menuLabel={t("modules.switchApplication")}
      icon={<AppsRoundedIcon />}
      iconOnly={iconOnly}
      loading={modulesQuery.isLoading}
      disabled={modulesQuery.isError}
    />
  );
}

function moduleName(
  module: Pick<ErpModule, "code" | "name">,
  t: (key: string, options?: { defaultValue?: string }) => string,
) {
  return t(`modules.${module.code}`, { defaultValue: module.name });
}

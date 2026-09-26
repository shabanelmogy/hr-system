"use client";

import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { Box } from "@mui/material";
import { ModuleLauncher } from "@/shared/components/layout/module-launcher";
import { RouteLoading } from "@/shared/components/feedback/routes/RouteLoading";
import RouteError from "@/shared/components/feedback/routes/RouteError";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { toLauncherModules } from "./modulePresentation";
import { getTenantAdministrationLauncherEntries } from "./tenantAdministrationLauncher";
import { useAccessibleModulesQuery } from "./useModulesQuery";
import { useTranslation } from "react-i18next";

export function ModuleLauncherPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const query = useAccessibleModulesQuery();
  if (query.isLoading) return <RouteLoading />;
  if (query.isError) {
    return <RouteError error={query.error} reset={() => void query.refetch()} />;
  }

  const modules = toLauncherModules(query.data ?? []);
  const administrationActions = getTenantAdministrationLauncherEntries(hasPermission).map(
    (entry) => ({
      ...entry,
      label:
        entry.code === "tenant-roles-permissions"
          ? t("modules.tenantRolesPermissions")
          : t("modules.tenantUsers"),
      icon:
        entry.code === "tenant-roles-permissions" ? (
          <AdminPanelSettingsRoundedIcon />
        ) : (
          <PeopleAltRoundedIcon />
        ),
      tone: "secondary" as const,
    }),
  );
  return (
    <Box sx={{ p: { xs: 0, md: 2 } }}>
      <ModuleLauncher modules={modules} actions={administrationActions} />
    </Box>
  );
}

"use client";

import { Box } from "@mui/material";
import { ModuleLauncher } from "@/shared/components/layout/module-launcher";
import { RouteLoading } from "@/shared/components/feedback/routes";
import RouteError from "@/shared/components/feedback/routes/RouteError";
import { toLauncherModules } from "./modulePresentation";
import { useAccessibleModulesQuery } from "./useModulesQuery";

export function ModuleLauncherPage() {
  const query = useAccessibleModulesQuery();
  if (query.isLoading) return <RouteLoading />;
  if (query.isError) {
    return <RouteError error={query.error} reset={() => void query.refetch()} />;
  }

  const modules = toLauncherModules(query.data ?? []);
  return (
    <Box sx={{ p: { xs: 0, md: 2 } }}>
      <ModuleLauncher modules={modules} />
    </Box>
  );
}

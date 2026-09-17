"use client";

import { Box } from "@mui/material";
import ForbiddenPage from "@/shared/components/auth/ForbiddenPage";
import { RouteLoading } from "@/shared/components/feedback/routes";
import RouteError from "@/shared/components/feedback/routes/RouteError";
import { SubmoduleLauncher } from "@/shared/components/layout/module-launcher";
import { toLauncherModule } from "./modulePresentation";
import { useAccessibleModulesQuery } from "./useModulesQuery";

export interface ModuleOverviewPageProps {
  moduleCode: string;
}

export function ModuleOverviewPage({ moduleCode }: ModuleOverviewPageProps) {
  const query = useAccessibleModulesQuery();
  if (query.isLoading) return <RouteLoading />;
  if (query.isError) {
    return <RouteError error={query.error} reset={() => void query.refetch()} />;
  }

  const moduleDefinition = (query.data ?? []).find(
    (item) => item.code.toLowerCase() === moduleCode.toLowerCase(),
  );
  if (!moduleDefinition) return <ForbiddenPage />;

  return (
    <Box sx={{ p: { xs: 0, md: 2 } }}>
      <SubmoduleLauncher module={toLauncherModule(moduleDefinition)} />
    </Box>
  );
}

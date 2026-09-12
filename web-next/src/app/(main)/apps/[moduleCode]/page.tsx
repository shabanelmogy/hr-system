"use client";

import { Box } from "@mui/material";
import { useParams } from "next/navigation";
import { toLauncherModule, useAccessibleModulesQuery } from "@/platform/modules";
import { SubmoduleLauncher } from "@/shared/components/layout/module-launcher";
import { RouteLoading } from "@/shared/components/feedback/routes";
import RouteError from "@/shared/components/feedback/routes/RouteError";
import ForbiddenPage from "@/shared/components/auth/ForbiddenPage";

export default function ModulePage() {
  const params = useParams<{ moduleCode: string }>();
  const query = useAccessibleModulesQuery();
  if (query.isLoading) return <RouteLoading />;
  if (query.isError) return <RouteError error={query.error} reset={() => void query.refetch()} />;
  const moduleDefinition = (query.data ?? []).find(item => item.code.toLowerCase() === params.moduleCode.toLowerCase());
  if (!moduleDefinition) return <ForbiddenPage />;
  const mapped = toLauncherModule(moduleDefinition);
  return <Box sx={{ p: { xs: 0, md: 2 } }}><SubmoduleLauncher module={mapped} /></Box>;
}

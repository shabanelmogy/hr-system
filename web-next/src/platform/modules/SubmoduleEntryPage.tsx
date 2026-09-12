"use client";

import ExtensionOffRoundedIcon from "@mui/icons-material/ExtensionOffRounded";
import { Box, Stack, Typography } from "@mui/material";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useSession } from "@/lib/auth/SessionContext";
import { canAccessRoute } from "@/lib/auth/route-access";
import ForbiddenPage from "@/shared/components/auth/ForbiddenPage";
import { RouteLoading } from "@/shared/components/feedback/routes";
import RouteError from "@/shared/components/feedback/routes/RouteError";
import { getFrontendSubmoduleDefinition } from "./registry";
import { useAccessibleModulesQuery } from "./useModulesQuery";
import { canAccessPathByModules } from "./routeRequirements";

export function SubmoduleEntryPage({
  moduleCode,
  submoduleCode,
}: {
  moduleCode: string;
  submoduleCode: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useSession();
  const query = useAccessibleModulesQuery(Boolean(user));
  const moduleDefinition = query.data?.find(
    (item) => item.code.toLowerCase() === moduleCode.toLowerCase(),
  );
  const submodule = moduleDefinition?.submodules.find(
    (item) => item.code.toLowerCase() === submoduleCode.toLowerCase(),
  );
  const destination = useMemo(() => {
    if (!user || query.isLoading || query.isError || !submodule) return undefined;
    return getFrontendSubmoduleDefinition(moduleCode, submoduleCode)?.entryCandidates.find(
      (path) => canAccessRoute(path, user) && canAccessPathByModules(path, query.data ?? []),
    );
  }, [moduleCode, query.data, query.isError, query.isLoading, submodule, submoduleCode, user]);

  useEffect(() => {
    if (destination) router.replace(destination as Route);
  }, [destination, router]);

  if (query.isLoading || destination) return <RouteLoading />;
  if (query.isError) return <RouteError error={query.error} reset={() => void query.refetch()} />;

  if (!moduleDefinition || !submodule) return <ForbiddenPage />;

  return (
    <Stack spacing={2} sx={{ alignItems: "center", py: 10, px: 2, textAlign: "center" }}>
      <Box sx={{ color: "text.secondary", "& > svg": { fontSize: 58 } }}>
        <ExtensionOffRoundedIcon />
      </Box>
      <Typography component="h1" variant="h5" sx={{ fontWeight: 800 }}>
        {t(`modules.submodules.${moduleDefinition.code}.${submodule.code}`, {
          defaultValue: submodule.name,
        })}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
        {t("modules.noAvailableFeatures")}
      </Typography>
    </Stack>
  );
}

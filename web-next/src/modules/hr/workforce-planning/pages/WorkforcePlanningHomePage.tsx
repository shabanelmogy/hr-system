"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/SessionContext";
import { FeatureModuleOverview, type FeatureModuleOverviewGroup } from "@/shared/components/layout";
import { getAuthorizedWorkforcePlanningNavigation } from "../navigation/workforcePlanningNavigation";

export default function WorkforcePlanningHomePage() {
  const { t } = useTranslation();
  const { user } = useSession();
  const items = useMemo(() => getAuthorizedWorkforcePlanningNavigation(user), [user]);
  const groups = useMemo<FeatureModuleOverviewGroup[]>(
    () => items.map((group) => ({
      id: group.id,
      title: t(group.titleKey),
      description: group.descriptionKey ? t(group.descriptionKey) : undefined,
      icon: group.icon,
      items: (group.children ?? []).flatMap((item) => item.href ? [{
        id: item.id,
        label: t(item.titleKey),
        description: item.descriptionKey ? t(item.descriptionKey) : undefined,
        href: item.href,
        icon: item.icon,
      }] : []),
    })),
    [items, t],
  );

  return (
    <FeatureModuleOverview
      title={t("workforcePlanning.overview.title")}
      description={t("workforcePlanning.overview.description")}
      countLabel={(count) => t("workforcePlanning.overview.count", { count })}
      openLabel={t("workforcePlanning.overview.open")}
      groups={groups}
    />
  );
}

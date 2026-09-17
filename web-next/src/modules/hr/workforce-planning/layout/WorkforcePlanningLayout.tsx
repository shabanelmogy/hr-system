"use client";

import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { appRoutes } from "@/config/routes";
import { useSession } from "@/lib/auth/SessionContext";
import { FeatureModuleLayout, type FeatureModuleNavigationItem } from "@/shared/components/layout";
import { getAuthorizedWorkforcePlanningNavigation } from "../navigation/workforcePlanningNavigation";
import type { WorkforcePlanningNavigationItem } from "../navigation/workforcePlanningNavigation";

function mapNavigation(items: readonly WorkforcePlanningNavigationItem[], translate: (key: string) => string): FeatureModuleNavigationItem[] {
  return items.map((item) => ({
    id: item.id,
    label: translate(item.titleKey),
    description: item.descriptionKey ? translate(item.descriptionKey) : undefined,
    href: item.href,
    icon: item.icon,
    children: item.children ? mapNavigation(item.children, translate) : undefined,
  }));
}

export default function WorkforcePlanningLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { user } = useSession();
  const items = useMemo(() => mapNavigation(getAuthorizedWorkforcePlanningNavigation(user), t), [t, user]);

  return (
    <FeatureModuleLayout
      title={t("menu.workforcePlanning")}
      description={t("menu.workforcePlanningDescription")}
      moduleHref={appRoutes.modules.hr.workforcePlanning.index}
      moduleIcon={<AccountTreeRoundedIcon />}
      navigationLabel={t("menu.workforcePlanningNavigation")}
      openNavigationLabel={t("menu.openWorkforcePlanningNavigation")}
      closeNavigationLabel={t("menu.closeWorkforcePlanningNavigation")}
      backLabel={t("menu.dashboard")}
      backHref={appRoutes.shell.home}
      items={items}
    >
      {children}
    </FeatureModuleLayout>
  );
}

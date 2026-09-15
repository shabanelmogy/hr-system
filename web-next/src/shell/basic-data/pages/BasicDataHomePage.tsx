"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/SessionContext";
import { FeatureModuleOverview, type FeatureModuleOverviewGroup } from "@/shared/components/layout";
import { getAuthorizedBasicDataNavigation } from "../navigation/basicDataNavigation";

export default function BasicDataHomePage() {
  const { t } = useTranslation();
  const { user } = useSession();
  const items = useMemo(() => getAuthorizedBasicDataNavigation(user), [user]);
  const groups = useMemo<FeatureModuleOverviewGroup[]>(
    () => items.map((group) => ({
      id: group.id,
      title: t(group.titleKey),
      description: group.descriptionKey ? t(group.descriptionKey) : undefined,
      icon: group.icon,
      items: (group.children?.length ? group.children : [group]).flatMap((item) => item.href ? [{
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
      title={t("menu.chooseBasicDataArea")}
      description={t("menu.basicDataDescription")}
      countLabel={(count) => t("menu.basicDataAreaCount", { count })}
      openLabel={t("menu.openBasicDataArea")}
      groups={groups}
    />
  );
}

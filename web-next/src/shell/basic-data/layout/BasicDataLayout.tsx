"use client";

import DatasetRoundedIcon from "@mui/icons-material/DatasetRounded";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { appRoutes } from "@/config/routes";
import { useSession } from "@/lib/auth/SessionContext";
import { FeatureModuleLayout, type FeatureModuleNavigationItem } from "@/shared/components/layout";
import { getAuthorizedBasicDataNavigation } from "../navigation/basicDataNavigation";
import type { BasicDataNavigationItem } from "../navigation/basicDataNavigation";

function mapNavigation(
  items: readonly BasicDataNavigationItem[],
  translate: (key: string) => string,
): FeatureModuleNavigationItem[] {
  return items.map((item) => ({
    id: item.id,
    label: translate(item.titleKey),
    description: item.descriptionKey ? translate(item.descriptionKey) : undefined,
    href: item.href,
    icon: item.icon,
    children: item.children ? mapNavigation(item.children, translate) : undefined,
  }));
}

export default function BasicDataLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { user } = useSession();
  const navigationItems = useMemo<FeatureModuleNavigationItem[]>(
    () => mapNavigation(getAuthorizedBasicDataNavigation(user), t),
    [t, user],
  );

  return (
    <FeatureModuleLayout
      title={t("menu.basicData")}
      description={t("menu.basicDataDescription")}
      moduleHref={appRoutes.basicData.index}
      moduleIcon={<DatasetRoundedIcon />}
      navigationLabel={t("menu.basicDataNavigation")}
      openNavigationLabel={t("menu.openBasicDataNavigation")}
      closeNavigationLabel={t("menu.closeBasicDataNavigation")}
      backLabel={t("menu.dashboard")}
      backHref={appRoutes.home}
      items={navigationItems}
    >
      {children}
    </FeatureModuleLayout>
  );
}

"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { appRoutes } from "@/config/routes";
import { isAuthorized } from "@/lib/auth/authorization";
import { useSession } from "@/lib/auth/SessionContext";
import { FeatureModuleLayout, type FeatureModuleNavigationItem } from "@/layouts/feature-layout";
import { getBasicDataNavigation } from "../navigation/basicDataNavigation";
import type { BasicDataNavigationItem } from "../navigation/basicDataNavigation";

function filterNavigation(
  items: readonly BasicDataNavigationItem[],
  user: ReturnType<typeof useSession>["user"],
): BasicDataNavigationItem[] {
  return items.flatMap((item) => {
    const children = item.children ? filterNavigation(item.children, user) : [];
    const itemAllowed = item.permissions.length === 0 || isAuthorized(user, { permissions: item.permissions });

    return itemAllowed || children.length > 0
      ? [{ ...item, children }]
      : [];
  });
}

function mapNavigation(
  items: readonly BasicDataNavigationItem[],
  translate: (key: string) => string,
): FeatureModuleNavigationItem[] {
  return items.map((item) => ({
    id: item.id,
    label: translate(item.titleKey),
    href: item.href,
    icon: item.icon,
    children: item.children ? mapNavigation(item.children, translate) : undefined,
  }));
}

export default function BasicDataLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { user } = useSession();
  const navigationItems = useMemo<FeatureModuleNavigationItem[]>(
    () => mapNavigation(filterNavigation(getBasicDataNavigation(), user), t),
    [t, user],
  );

  return (
    <FeatureModuleLayout
      title={t("menu.basicData")}
      description={t("menu.basicDataDescription")}
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

import type { ReactNode } from "react";
import type { AppPath } from "@/config/routes";

export interface FeatureModuleNavigationItem {
  id: string;
  label: string;
  href?: AppPath;
  icon: ReactNode;
  description?: string;
  children?: readonly FeatureModuleNavigationItem[];
}

export interface FeatureModuleLayoutProps {
  title: string;
  description?: string;
  moduleHref: AppPath;
  moduleIcon: ReactNode;
  navigationLabel: string;
  openNavigationLabel: string;
  closeNavigationLabel: string;
  backLabel: string;
  backHref: AppPath;
  items: readonly FeatureModuleNavigationItem[];
  children: ReactNode;
}

import type { ReactNode } from "react";
import type { AppPath } from "@/config/routes";

export interface FeatureModuleOverviewItem {
  id: string;
  label: string;
  description?: string;
  href: AppPath;
  icon: ReactNode;
}

export interface FeatureModuleOverviewGroup {
  id: string;
  title: string;
  description?: string;
  icon: ReactNode;
  items: readonly FeatureModuleOverviewItem[];
}

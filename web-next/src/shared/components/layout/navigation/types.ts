import type { ReactElement } from "react";
import type { PermissionString } from "@/lib/auth/permissions";
export interface NavigationItem {
  id?: string;
  title: string;
  icon: ReactElement;
  path?: string;
  roles?: string[];
  permissions?: PermissionString[];
  items?: NavigationItem[];
}
export interface NavigationSection extends NavigationItem { id: string }
export type NavigationConfig = NavigationSection[];

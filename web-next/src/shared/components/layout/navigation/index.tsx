import type { ReactElement } from "react";
import type { PermissionString } from "@/lib/auth/permissions";
import ColoredIcon from "./ColoredIcon";
import type { NavigationItem, NavigationSection } from "./types";
export type { NavigationItem, NavigationSection, NavigationConfig } from "./types";
export const createColoredIcon = (icon: ReactElement, color: string) => <ColoredIcon color={color}>{icon}</ColoredIcon>;
export const createNavItem = (title: string, icon: ReactElement, path?: string, roles?: string[], permissions?: PermissionString[], items?: NavigationItem[]): NavigationItem => ({ title, icon, path, roles, permissions, items });
export const createNavSection = (id: string, title: string, icon: ReactElement, items: NavigationItem[], roles?: string[], permissions?: PermissionString[]): NavigationSection => ({ id, title, icon, items, roles, permissions });

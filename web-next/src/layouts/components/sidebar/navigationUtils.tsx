// navigationUtils.tsx
import { ReactElement } from "react";
import ColoredIcon from "./ColoredIcon";
import { NavigationItem, NavigationSection, NavigationSectionId, NavigationTitles, UserRoles, NavigationConfig, PermissionArray, RoleArray } from "./navigationTypes";
import type { PermissionString } from "@/lib/auth/permissions";
import { isAuthorized } from "@/lib/auth/authorization";

// Helper to create a colored icon
export const createColoredIcon = (icon: ReactElement, color: string): ReactElement => (
  <ColoredIcon color={color}>
    {icon}
  </ColoredIcon>
);

// Helper to create a navigation item
export const createNavItem = (
  title: NavigationTitles | string,
  icon: ReactElement,
  path?: string,
  roles?: UserRoles[],
  permissions?: PermissionString[],
  items?: NavigationItem[]
): NavigationItem => ({
  title,
  icon,
  path,
  roles,
  permissions,
  items,
});

// Helper to create a navigation section
export const createNavSection = (
  id: NavigationSectionId,
  title: NavigationTitles | string,
  icon: ReactElement,
  items: NavigationItem[],
  roles?: UserRoles[],
  permissions?: PermissionString[]
): NavigationSection => ({
  id,
  title,
  icon,
  items,
  roles,
  permissions,
});

// Keep sidebar filtering aligned with route and component authorization.
export const canAccess = (
  roles: RoleArray = [],
  permissions: PermissionArray = [],
  userRoles: readonly string[] = [],
  userPermissions: readonly string[] = []
): boolean => {
  return isAuthorized(
    { roles: userRoles, permissions: userPermissions },
    { roles, permissions },
  );
};

// Filter out items based on roles and permissions (recursive)
export const filterItems = (
  items: NavigationItem[],
  userRoles: readonly string[],
  userPermissions: readonly string[]
): NavigationItem[] => {
  return items.flatMap((item) => {
    const filteredChildren = item.items
      ? filterItems(item.items, userRoles, userPermissions)
      : [];
    const itemAccessible = canAccess(
      item.roles || [],
      item.permissions || [],
      userRoles,
      userPermissions
    );

    return itemAccessible || filteredChildren.length > 0
      ? [{ ...item, items: filteredChildren }]
      : [];
  });
};

// Filter navigation config based on user permissions
export const filterNavigationConfig = (
  fullConfig: NavigationConfig,
  userRoles: readonly string[],
  userPermissions: readonly string[]
): NavigationConfig => {
  return fullConfig
    .map((section: NavigationSection) => {
      // If the section has items, filter them
      if (section.items) {
        const filteredItems = filterItems(section.items, userRoles, userPermissions);
        // If the section has any visible items after filtering, return it
        if (filteredItems.length > 0) {
          return {
            ...section,
            items: filteredItems,
          };
        }
        // Otherwise, filter out the whole section
        return null;
      }
      // If it's a direct link, check its permissions
      if (canAccess(section.roles || [], section.permissions || [], userRoles, userPermissions)) {
        return section;
      }
      return null;
    })
    .filter((section): section is NavigationSection => section !== null);
};

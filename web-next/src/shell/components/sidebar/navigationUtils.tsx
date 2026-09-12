// navigationUtils.tsx
import { NavigationItem, NavigationSection, NavigationConfig, PermissionArray, RoleArray } from "./navigationTypes";
import { isAuthorized } from "@/lib/auth/authorization";
import {
  canAccessPathByModules,
  type AccessibleModuleDefinition,
} from "@/platform/modules";

export { createColoredIcon, createNavItem, createNavSection } from "@/shared/components/layout/navigation";

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

    // A permitted group without a direct destination must still have a
    // visible descendant; otherwise the sidebar renders an empty accordion.
    if (filteredChildren.length > 0) {
      const visibleItem: NavigationItem = {
        ...item,
        // A group can stay visible because a child is allowed, but its own
        // restricted destination must not remain clickable.
        path: itemAccessible ? item.path : undefined,
        items: item.items ? filteredChildren : undefined,
      };
      return [visibleItem];
    }
    if (itemAccessible && item.path) {
      const directItem: NavigationItem = { ...item, items: undefined };
      return [directItem];
    }
    return [];
  });
};

// Filter navigation config based on user permissions
export const filterNavigationConfig = (
  fullConfig: NavigationConfig,
  userRoles: readonly string[],
  userPermissions: readonly string[]
): NavigationConfig => {
  return fullConfig
    .map((section: NavigationSection): NavigationSection | null => {
      // If the section has items, filter them
      if (section.items?.length) {
        const filteredItems = filterItems(section.items, userRoles, userPermissions);
        // If the section has any visible items after filtering, return it
        if (filteredItems.length > 0) {
          return {
            ...section,
            path: canAccess(section.roles || [], section.permissions || [], userRoles, userPermissions) ? section.path : undefined,
            items: filteredItems,
          };
        }
        if (section.path && canAccess(section.roles || [], section.permissions || [], userRoles, userPermissions)) {
          return { ...section, items: undefined };
        }
        // Otherwise, filter out the whole section
        return null;
      }
      // If it's a direct link, check its permissions
      if (section.path && canAccess(section.roles || [], section.permissions || [], userRoles, userPermissions)) {
        return { ...section, items: undefined };
      }
      return null;
    })
    .filter((section): section is NavigationSection => section !== null);
};

export const filterNavigationConfigByModules = (
  config: NavigationConfig,
  modules: readonly AccessibleModuleDefinition[],
): NavigationConfig => {
  const filterItemsByModule = (items: NavigationItem[]): NavigationItem[] => items.flatMap(item => {
    const children = item.items ? filterItemsByModule(item.items) : [];
    const directPathAccessible = item.path
      ? canAccessPathByModules(item.path, modules)
      : false;
    return directPathAccessible || children.length > 0
      ? [{ ...item, path: directPathAccessible ? item.path : undefined, items: children.length ? children : undefined }]
      : [];
  });
  return config.reduce<NavigationConfig>((sections, section) => {
    const items = section.items ? filterItemsByModule(section.items) : [];
    if (items.length > 0) {
      sections.push({ ...section, path: section.path && canAccessPathByModules(section.path, modules) ? section.path : undefined, items });
    } else if (section.path && canAccessPathByModules(section.path, modules)) {
      sections.push({ ...section, items: undefined });
    }
    return sections;
  }, []);
};

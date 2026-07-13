// navigationUtils.tsx
import { ReactElement } from "react";
import { ColoredIcon } from "../../../constants/styles";
import { NavigationItem, NavigationSection, NavigationSectionId, NavigationTitles, UserRoles, NavigationConfig, PermissionArray, RoleArray } from "./navigationTypes";
import { PermissionString } from "../../../constants/appPermissions";
import { authService } from "../../../shared/services";

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

// Simple function to check if user has role OR permission
export const canAccess = (roles: RoleArray = [], permissions: PermissionArray = []): boolean => {
  // If no roles or permissions specified, allow access
  if (roles.length === 0 && permissions.length === 0) {
    return true;
  }

  // Convert enum arrays to string arrays for authService compatibility
  const roleStrings = roles.map(role => role.toString());
  // Permissions are already strings, no need to convert
  const permissionStrings = permissions;

  // Check if user has any of the roles
  const hasRole: boolean = roleStrings.length > 0 ? authService.isInRole(roleStrings) : false;

  // Check if user has any of the permissions
  const hasPermission: boolean =
    permissionStrings.length > 0 ? authService.hasPermission(permissionStrings) : false;

  // Return true if user has role OR permission
  return hasRole || hasPermission;
};

// Filter out items based on roles and permissions (recursive)
export const filterItems = (items: NavigationItem[]): NavigationItem[] => {
  return items
    .filter((item) => {
      // Check if the item itself is accessible
      const itemAccessible = canAccess(item.roles || [], item.permissions || []);
      let hasAccessibleChildren = false;

      // If item has children, check if any are accessible
      if (item.items && item.items.length > 0) {
        const filteredChildren = filterItems(item.items);
        hasAccessibleChildren = filteredChildren.length > 0;
        // Update the item's children
        (item as any).items = filteredChildren;
      }

      // Include item if it's accessible or has accessible children
      return itemAccessible || hasAccessibleChildren;
    });
};

// Filter navigation config based on user permissions
export const filterNavigationConfig = (fullConfig: NavigationConfig): NavigationConfig => {
  return fullConfig
    .map((section: NavigationSection) => {
      // If the section has items, filter them
      if (section.items) {
        const filteredItems: NavigationItem[] = filterItems(section.items);
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
      if (canAccess(section.roles || [], section.permissions || [])) {
        return section;
      }
      return null;
    })
    .filter((section): section is NavigationSection => section !== null);
};
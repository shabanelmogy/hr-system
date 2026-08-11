import type { FeatureModuleNavigationItem } from "./types";

export function isFeaturePathActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findActiveNavigationTrail(
  items: readonly FeatureModuleNavigationItem[],
  pathname: string,
): FeatureModuleNavigationItem[] {
  for (const item of items) {
    const childTrail = findActiveNavigationTrail(item.children ?? [], pathname);
    if (childTrail.length > 0) return [item, ...childTrail];

    if (item.href && isFeaturePathActive(pathname, item.href)) return [item];
  }

  return [];
}

export function flattenFeatureNavigation(
  items: readonly FeatureModuleNavigationItem[],
): FeatureModuleNavigationItem[] {
  return items.flatMap((item) =>
    item.children?.length ? flattenFeatureNavigation(item.children) : item.href ? [item] : [],
  );
}

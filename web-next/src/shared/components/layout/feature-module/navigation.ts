import type { FeatureModuleNavigationItem } from "./types";

export function isFeaturePathActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findActiveNavigationTrail(
  items: readonly FeatureModuleNavigationItem[],
  pathname: string,
): FeatureModuleNavigationItem[] {
  return items.reduce<FeatureModuleNavigationItem[]>((bestTrail, item) => {
    const childTrail = findActiveNavigationTrail(item.children ?? [], pathname);
    const candidate = childTrail.length > 0
      ? [item, ...childTrail]
      : item.href && isFeaturePathActive(pathname, item.href)
        ? [item]
        : [];
    const candidateLength = candidate.at(-1)?.href?.length ?? 0;
    const bestLength = bestTrail.at(-1)?.href?.length ?? 0;
    return candidateLength > bestLength ? candidate : bestTrail;
  }, []);
}

export function flattenFeatureNavigation(
  items: readonly FeatureModuleNavigationItem[],
): FeatureModuleNavigationItem[] {
  return items.flatMap((item) =>
    item.children?.length ? flattenFeatureNavigation(item.children) : item.href ? [item] : [],
  );
}

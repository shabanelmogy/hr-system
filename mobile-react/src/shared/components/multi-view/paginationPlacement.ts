export const inlinePaginationItemLimit = 5;

export function shouldPinPagination(
  visibleItems: number,
  hasFooterHost: boolean,
  inlineItemLimit = inlinePaginationItemLimit,
): boolean {
  return hasFooterHost && visibleItems > inlineItemLimit;
}

export interface OfflineScope {
  userId: string;
  tenantId: string;
  companyId: number;
}

export function normalizeOfflineScope(scope: OfflineScope): OfflineScope {
  const userId = scope.userId.trim();
  const tenantId = scope.tenantId.trim();
  if (!userId) throw new Error('Offline scope requires a user id.');
  if (!tenantId) throw new Error('Offline scope requires a tenant id.');
  if (!Number.isInteger(scope.companyId) || scope.companyId <= 0) {
    throw new Error('Offline scope requires a positive integer company id.');
  }

  return { userId, tenantId, companyId: scope.companyId };
}

export function offlineScopeKey(scope: OfflineScope): string {
  const normalized = normalizeOfflineScope(scope);
  return `${encodeURIComponent(normalized.userId)}:${encodeURIComponent(normalized.tenantId)}:${normalized.companyId}`;
}

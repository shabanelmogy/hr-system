export type OfflineReadableFeature = 'countries';

export interface OfflineReadPolicy {
  feature: OfflineReadableFeature;
  maxAgeMs: number;
}

export const OFFLINE_READ_POLICIES: Readonly<Record<OfflineReadableFeature, OfflineReadPolicy>> = {
  countries: {
    feature: 'countries',
    maxAgeMs: 24 * 60 * 60 * 1000,
  },
};

export function isOfflineReadFresh(
  cachedAt: string | null | undefined,
  policy: OfflineReadPolicy,
  now = Date.now(),
): boolean {
  if (!cachedAt) return false;
  const timestamp = Date.parse(cachedAt);
  return Number.isFinite(timestamp) && timestamp <= now && now - timestamp <= policy.maxAgeMs;
}

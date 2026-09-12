import { isOfflineReadFresh, OFFLINE_READ_POLICIES } from './offline-read-policy';

describe('offline read policy', () => {
  const now = Date.parse('2026-09-09T12:00:00.000Z');

  it('accepts Countries cache inside the configured freshness window', () => {
    expect(isOfflineReadFresh('2026-09-08T12:00:00.000Z', OFFLINE_READ_POLICIES.countries, now)).toBe(true);
  });

  it('rejects stale, missing, invalid, and future cache timestamps', () => {
    expect(isOfflineReadFresh('2026-09-08T11:59:59.999Z', OFFLINE_READ_POLICIES.countries, now)).toBe(false);
    expect(isOfflineReadFresh(null, OFFLINE_READ_POLICIES.countries, now)).toBe(false);
    expect(isOfflineReadFresh('not-a-date', OFFLINE_READ_POLICIES.countries, now)).toBe(false);
    expect(isOfflineReadFresh('2026-09-09T12:00:00.001Z', OFFLINE_READ_POLICIES.countries, now)).toBe(false);
  });
});

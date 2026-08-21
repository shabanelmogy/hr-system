import { describe, expect, it } from '@jest/globals';

import {
  getAllRealtimeQueryKeys,
  getRealtimeQueryKeys,
  isKnownRealtimeResource,
} from '../realtime-query-registry';

describe('realtime query registry', () => {
  it('targets every appointment range through the stable feature prefix', () => {
    expect(getRealtimeQueryKeys('appointments')).toContainEqual([
      'platform-tools',
      'appointments',
    ]);
  });

  it('invalidates all country queries through the stable feature prefix', () => {
    expect(isKnownRealtimeResource('countries')).toBe(true);
    expect(getRealtimeQueryKeys('countries')).toEqual([['countries']]);
  });

  it('invalidates all State queries through the stable feature prefix', () => {
    expect(isKnownRealtimeResource('states')).toBe(true);
    expect(getRealtimeQueryKeys('states')).toEqual([['states']]);
  });

  it('deduplicates reconnect invalidation prefixes', () => {
    const serialized = getAllRealtimeQueryKeys().map((key) => JSON.stringify(key));
    expect(new Set(serialized).size).toBe(serialized.length);
  });
});

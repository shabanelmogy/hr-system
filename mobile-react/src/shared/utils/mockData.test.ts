import { describe, expect, it } from '@jest/globals';
import { getNextMockSample } from './mockData';

describe('getNextMockSample', () => {
  it('does not repeat a sample until the set is exhausted', () => {
    const used = new Set<number>();
    expect(getNextMockSample(['first', 'second'], used, () => 0)).toBe('first');
    expect(getNextMockSample(['first', 'second'], used, () => 0)).toBe('second');
  });
});

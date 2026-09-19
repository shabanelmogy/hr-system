import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import { createGeographicalNameSchema, isValidGeographicalName } from './geographical-name';

const t = ((key: string) => key) as TFunction;

describe('geographical name validation', () => {
  it('accepts printable Unicode names with spaces and digits', () => {
    expect(isValidGeographicalName('New Cairo 2')).toBe(true);
    expect(isValidGeographicalName('منطقة 7')).toBe(true);
    expect(createGeographicalNameSchema(t).parse(' New Cairo 2 ')).toBe('New Cairo 2');
  });

  it('rejects control characters and line breaks', () => {
    expect(isValidGeographicalName('Cairo\nSouth')).toBe(false);
    expect(() => createGeographicalNameSchema(t).parse('Cairo\nSouth')).toThrow();
  });

  it('trims and canonicalizes Unicode before enforcing length', () => {
    expect(createGeographicalNameSchema(t).parse(' Cafe\u0301 ')).toBe('Café');
  });
});

import { describe, expect, it } from '@jest/globals';
import { getFiscalYearViews, isFiscalYearView } from './fiscal-year-views';

describe('Fiscal Year view policy', () => {
  it('allows only table/cards and optionally report, regardless of permission', () => {
    expect(getFiscalYearViews(false)).toEqual(['table', 'cards']);
    expect(getFiscalYearViews(true)).toEqual(['table', 'cards', 'report']);
    expect(isFiscalYearView('report', false)).toBe(false);
    expect(isFiscalYearView('report', true)).toBe(true);

    for (const view of ['import', 'export', 'chart']) {
      expect(isFiscalYearView(view, false)).toBe(false);
      expect(isFiscalYearView(view, true)).toBe(false);
    }
  });
});

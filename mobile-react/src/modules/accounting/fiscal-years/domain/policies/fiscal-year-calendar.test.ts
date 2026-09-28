import { buildFiscalPeriodPreview } from './fiscal-period-preview';
import { canSetFiscalYearAsCurrent, getAvailableFiscalYearLifecycleActions } from './fiscal-year-lifecycle';

describe('fiscal year domain calendar policies', () => {
  it('keeps lifecycle transitions explicit', () => {
    expect([1, 2, 3, 4, 5].map(status => getAvailableFiscalYearLifecycleActions(status as 1 | 2 | 3 | 4 | 5)))
      .toEqual([['open'], ['beginClosing'], ['close'], ['reopen', 'lock'], ['reopen']]);
  });

  it.each([
    [1, false],
    [2, true],
    [3, false],
    [4, false],
    [5, false],
  ] as const)('allows company Current only for an active Open year (status %s)', (status, expected) => {
    expect(canSetFiscalYearAsCurrent({ status, isDeleted: false, isCurrent: false })).toBe(expected);
  });

  it('rejects archived and already-current Open years', () => {
    expect(canSetFiscalYearAsCurrent({ status: 2, isDeleted: true, isCurrent: false })).toBe(false);
    expect(canSetFiscalYearAsCurrent({ status: 2, isDeleted: false, isCurrent: true })).toBe(false);
  });

  it('previews contiguous periods for an end-of-month fiscal start', () => {
    const periods = buildFiscalPeriodPreview('fy-odd', '2027-01-31', 2);
    expect(periods).toHaveLength(4);
    expect(periods[0]).toMatchObject({ code: 'FY-ODD-P01', startDate: '2027-01-31', endDate: '2027-04-29' });
    expect(periods.at(-1)?.endDate).toBe('2028-01-30');
    periods.slice(1).forEach((period, index) => {
      const expected = new Date(`${periods[index]!.endDate}T00:00:00Z`);
      expected.setUTCDate(expected.getUTCDate() + 1);
      expect(period.startDate).toBe(expected.toISOString().slice(0, 10));
    });
  });
});

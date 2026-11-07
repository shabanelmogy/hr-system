import { emptyErrorLogFilters, resolveErrorLogCriteria } from './error-log-filters';

describe('system error log criteria', () => {
  it('converts valid UTC calendar days to inclusive server bounds', () => {
    expect(
      resolveErrorLogCriteria(
        { ...emptyErrorLogFilters, from: '2026-02-01', to: '2026-02-28' },
        ' issue ',
        2,
        25,
      ),
    ).toEqual({
      valid: true,
      criteria: {
        fromUtc: '2026-02-01T00:00:00.000Z',
        toUtc: '2026-02-28T23:59:59.999Z',
        search: 'issue',
        page: 2,
        pageSize: 25,
      },
    });
  });
  it('suppresses inverted and rollover day criteria', () => {
    expect(resolveErrorLogCriteria({ ...emptyErrorLogFilters, from: '2026-02-30' }, '')).toEqual({
      valid: false,
      issue: 'range',
    });
    expect(
      resolveErrorLogCriteria(
        { ...emptyErrorLogFilters, from: '2026-03-02', to: '2026-03-01' },
        '',
      ),
    ).toEqual({ valid: false, issue: 'range' });
  });
  it('preserves the full supported date-only range without the Date year offset', () => {
    expect(
      resolveErrorLogCriteria(
        { ...emptyErrorLogFilters, from: '0001-01-01', to: '0099-12-31' },
        '',
      ),
    ).toEqual({
      valid: true,
      criteria: {
        page: 1,
        pageSize: 25,
        fromUtc: '0001-01-01T00:00:00.000Z',
        toUtc: '0099-12-31T23:59:59.999Z',
      },
    });
    expect(resolveErrorLogCriteria({ ...emptyErrorLogFilters, from: '0000-01-01' }, '')).toEqual({
      valid: false,
      issue: 'range',
    });
  });
  it('rejects unsupported UI page sizes and unbounded text before a request', () => {
    expect(resolveErrorLogCriteria(emptyErrorLogFilters, '', 1, 20)).toEqual({
      valid: false,
      issue: 'criteria',
    });
    expect(resolveErrorLogCriteria(emptyErrorLogFilters, 'x'.repeat(121))).toEqual({
      valid: false,
      issue: 'criteria',
    });
  });
});

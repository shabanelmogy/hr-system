import { auditCriteria, emptyAuditFilters, changeAuditModule } from './audit-criteria';

describe('Audit filter and local calendar query contract', () => {
  it('omits inactive filters and trims only the authoritative record-key search', () => {
    expect(auditCriteria(emptyAuditFilters, '  42  ')).toEqual({
      valid: true,
      criteria: { entityKey: '42' },
    });
    expect(auditCriteria(emptyAuditFilters, '  ')).toEqual({ valid: true, criteria: {} });
    expect(auditCriteria(emptyAuditFilters, 'x'.repeat(201))).toEqual({
      valid: false,
      issue: 'search',
    });
  });

  it('resets the dependent entity when module changes and keeps the other criteria', () => {
    expect(
      changeAuditModule({ ...emptyAuditFilters, entityName: 'Country', action: 'Modified' }, 'hr'),
    ).toEqual({
      ...emptyAuditFilters,
      moduleCode: 'hr',
      entityName: '',
      action: 'Modified',
    });
  });

  it('rejects invalid calendar dates and inverted ranges instead of normalizing them into GET parameters', () => {
    for (const patch of [
      { from: '2026-02-30' },
      { to: 'invalid' },
      { from: '2026-11-07', to: '2026-11-06' },
    ])
      expect(auditCriteria({ ...emptyAuditFilters, ...patch }, '')).toEqual({
        valid: false,
        issue: 'range',
      });
  });

  it('converts the actual local calendar day to UTC and preserves independently optional bounds', () => {
    const result = auditCriteria(
      { ...emptyAuditFilters, from: '2026-11-06', to: '2026-11-06' },
      '',
    );
    expect(result.valid).toBe(true);
    if (!result.valid) throw Error('Expected valid calendar criteria');
    const start = new Date(result.criteria.fromUtc ?? '');
    const end = new Date(result.criteria.toUtc ?? '');
    expect([
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      start.getHours(),
      start.getMinutes(),
    ]).toEqual([2026, 10, 6, 0, 0]);
    expect([
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      end.getHours(),
      end.getMinutes(),
      end.getSeconds(),
      end.getMilliseconds(),
    ]).toEqual([2026, 10, 6, 23, 59, 59, 999]);
    expect(auditCriteria({ ...emptyAuditFilters, to: '2026-11-06' }, '')).toEqual({
      valid: true,
      criteria: { toUtc: end.toISOString() },
    });
  });
});

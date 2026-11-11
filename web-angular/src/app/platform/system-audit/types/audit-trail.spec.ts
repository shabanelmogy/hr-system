import { auditKey, parseAuditPage, parseAuditDetails, parseAuditFilters } from './audit-trail';
import { systemAuditAllowed } from '../system-audit-access';

const entry = {
  moduleCode: 'reference-data',
  id: 1,
  entityName: 'Country',
  entityKey: '42',
  entityDisplay: 'Egypt',
  action: 'Modified',
  userId: 'actor-1',
  userName: 'Administrator',
  occurredOn: '2026-11-06T07:00:00Z',
  correlationId: null,
  changeCount: 1,
};

describe('System audit read contracts', () => {
  it('preserves opaque cursor and module-local identities without inventing a total', () => {
    const page = parseAuditPage({
      items: [entry, { ...entry, moduleCode: 'hr' }],
      nextCursor: 'opaque+/cursor==',
    });
    expect(page.items.map(auditKey)).toEqual(['reference-data:1', 'hr:1']);
    expect(page.nextCursor).toBe('opaque+/cursor==');
    expect(page).not.toHaveProperty('total');
    expect(parseAuditPage({ items: [], nextCursor: null })).toEqual({
      items: [],
      nextCursor: null,
    });
  });

  it('rejects malformed fields, unknown actions and duplicate composite identities', () => {
    for (const patch of [
      { id: 0 },
      { id: Number.MAX_SAFE_INTEGER + 1 },
      { id: '1' },
      { moduleCode: '' },
      { changeCount: -1 },
      { action: 'Updated' },
      { occurredOn: 'invalid' },
      { occurredOn: '2026-11-06T25:00:00Z' },
      { userName: {} },
    ])
      expect(() => parseAuditPage({ items: [{ ...entry, ...patch }], nextCursor: null })).toThrow();
    expect(() => parseAuditPage({ items: [entry, entry], nextCursor: null })).toThrow();
    expect(() => parseAuditPage({ items: [entry], nextCursor: '' })).toThrow();
    expect(() => parseAuditPage({ items: [entry], nextCursor: 'x'.repeat(401) })).toThrow();
  });

  it('accepts the requested 25-row page and rejects a larger server payload', () => {
    const items = Array.from({ length: 26 }, (_, index) => ({ ...entry, id: index + 1 }));
    expect(parseAuditPage({ items: items.slice(0, 25), nextCursor: 'next' }).items).toHaveLength(
      25,
    );
    expect(() => parseAuditPage({ items, nextCursor: null })).toThrow();
  });

  it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1, '28'])(
    'rejects an invalid total %s',
    (totalCount) => {
      expect(() => parseAuditPage({ items: [], nextCursor: null, totalCount })).toThrow();
    },
  );

  it('validates nullable textual field snapshots and exact requested detail identity', () => {
    const value = {
      entry,
      changes: [{ field: 'NameEn', oldValue: null, newValue: '<script>text</script>' }],
    };
    expect(parseAuditDetails(value, { moduleCode: 'reference-data', id: 1 }).changes).toEqual(
      value.changes,
    );
    expect(() => parseAuditDetails(value, { moduleCode: 'hr', id: 1 })).toThrow();
    expect(() => parseAuditDetails(value, { moduleCode: 'reference-data', id: 2 })).toThrow();
    expect(() =>
      parseAuditDetails({ ...value, changes: [{ field: 'Name', newValue: {} }] }, entry),
    ).toThrow();
  });

  it('validates server module/entity filter shapes without accepting a fake empty payload', () => {
    expect(
      parseAuditFilters({ modules: [{ moduleCode: 'hr', entityNames: ['Department'] }] }),
    ).toEqual([{ moduleCode: 'hr', entityNames: ['Department'] }]);
    expect(parseAuditFilters({ modules: [] })).toEqual([]);
    expect(() => parseAuditFilters({})).toThrow();
    expect(() =>
      parseAuditFilters({ modules: [{ moduleCode: 'hr', entityNames: [1] }] }),
    ).toThrow();
    expect(() =>
      parseAuditFilters({
        modules: [
          { moduleCode: 'hr', entityNames: [] },
          { moduleCode: 'hr', entityNames: [] },
        ],
      }),
    ).toThrow();
  });

  it('requires the Super Admin role and exact system grant independently', () => {
    const grant = 'SystemAuditTrail:View';
    expect(systemAuditAllowed(null)).toBe(false);
    expect(systemAuditAllowed({ roles: ['super_admin'], permissions: [] })).toBe(false);
    expect(systemAuditAllowed({ roles: ['admin'], permissions: [grant] })).toBe(false);
    expect(systemAuditAllowed({ roles: ['super_admin'], permissions: ['AuditTrail:View'] })).toBe(
      false,
    );
    expect(systemAuditAllowed({ roles: ['super_admin'], permissions: [grant] })).toBe(true);
  });
});

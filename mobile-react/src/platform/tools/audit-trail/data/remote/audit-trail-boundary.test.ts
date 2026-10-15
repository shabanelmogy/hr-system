import { auditTrailEndpoints } from './audit-trail-endpoints';
import { auditTrailDetailsSchema, auditTrailPageSchema } from './audit-trail-schemas';

describe('audit trail remote boundary', () => {
  it('targets the Platform audit-trail endpoints', () => {
    expect(auditTrailEndpoints.list).toBe('audit-trail');
    expect(auditTrailEndpoints.filters).toBe('audit-trail/filters');
    expect(auditTrailEndpoints.entry('reference-data', 42)).toBe('audit-trail/reference-data/42');
  });

  it('parses a page and falls back to Modified for unknown actions', () => {
    const page = auditTrailPageSchema.parse({
      items: [
        { moduleCode: 'hr', id: 7, entityName: 'Department', entityKey: '12', action: 'Deleted', occurredOn: '2026-01-01T08:00:00Z', changeCount: 2 },
        { moduleCode: 'acc', id: 8, entityName: 'FiscalYear', entityKey: '3', action: 'Weird', occurredOn: '2026-01-01T09:00:00Z' },
      ],
      nextCursor: '',
    });

    expect(page.items.map((item) => item.action)).toEqual(['Deleted', 'Modified']);
    expect(page.items[0]).toMatchObject({ userName: null, entityDisplay: null });
    expect(page.nextCursor).toBeNull();
  });

  it('parses field details', () => {
    const details = auditTrailDetailsSchema.parse({
      entry: { moduleCode: 'hr', id: 1, entityName: 'Branch', entityKey: '1', action: 'Created', occurredOn: '2026-01-01T08:00:00Z' },
      changes: [{ field: 'NameEn', oldValue: null, newValue: 'Cairo' }],
    });

    expect(details.changes).toEqual([{ field: 'NameEn', oldValue: null, newValue: 'Cairo' }]);
  });
});

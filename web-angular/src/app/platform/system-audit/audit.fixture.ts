import type { AuditDetails, AuditItem } from './types/audit-trail';

export const auditFixture: AuditItem = {
  moduleCode: 'hr',
  id: 1,
  entityName: 'Department',
  entityKey: '42',
  entityDisplay: 'Administration',
  action: 'Modified',
  userId: 'test-actor',
  userName: 'Browser Administrator',
  occurredOn: '2026-11-06T07:00:00Z',
  correlationId: null,
  changeCount: 26,
};
export const auditDetailFixture: AuditDetails = {
  entry: auditFixture,
  changes: Array.from({ length: 26 }, (_, index) => ({
    field: index === 0 ? 'NameEn' : 'Field' + index,
    oldValue: index === 0 ? null : 'Before ' + index,
    newValue: index === 0 ? '<script>literal text</script>' : 'After ' + index,
  })),
};

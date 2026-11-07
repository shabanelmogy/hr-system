import {
  parseGridFilters,
  type GridColumnFilter,
  type GridFilters,
} from '../../../shared/data/public-api';

export const auditColumnDefinitions: readonly GridColumnFilter[] = [
  { field: 'occurredOn', type: 'date', maxConstraints: 4 },
  ...['action', 'record', 'moduleCode', 'userName'].map((field) => ({
    field,
    type: 'text' as const,
    maxLength: 200,
    maxConstraints: 4,
  })),
  {
    field: 'changeCount',
    type: 'number',
    numberMode: 'integer',
    minimum: -Number.MAX_SAFE_INTEGER,
    maximum: Number.MAX_SAFE_INTEGER,
    maxConstraints: 4,
  },
];

export function parseAuditColumnFilters(input: unknown): GridFilters {
  return parseGridFilters(input, auditColumnDefinitions);
}
export function auditColumnFilterJson(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (new TextEncoder().encode(value).byteLength > 16384)
    throw Error('Audit filters are too large');
  const filters = parseAuditColumnFilters(JSON.parse(value));
  if (
    filters.some(
      (group) =>
        group.field === 'action' &&
        group.constraints.some(
          (rule) =>
            !['equals', 'notEquals'].includes(rule.matchMode) ||
            !['Created', 'Modified', 'Deleted', 'Restored'].includes(String(rule.value)),
        ),
    )
  )
    throw Error('Invalid audit action filter');
  return JSON.stringify(filters);
}

import {
  parseGridFilters,
  type GridColumnFilter,
  type GridFilters,
} from '../../../shared/data/public-api';

export const errorLogColumnDefinitions: readonly GridColumnFilter[] = [
  { field: 'occurredOnUtc', type: 'date', maxConstraints: 4 },
  ...[
    'source',
    'severity',
    'userName',
    'service',
    'action',
    'client',
    'browser',
    'summary',
    'ipAddress',
  ].map((field) => ({ field, type: 'text' as const, maxLength: 200, maxConstraints: 4 })),
  ...['statusCode', 'durationMs'].map((field) => ({
    field,
    type: 'number' as const,
    numberMode: 'integer' as const,
    minimum: -Number.MAX_SAFE_INTEGER,
    maximum: Number.MAX_SAFE_INTEGER,
    maxConstraints: 4,
  })),
];

export function parseErrorLogColumnFilters(input: unknown): GridFilters {
  return parseGridFilters(input, errorLogColumnDefinitions);
}
export function errorLogColumnFilterJson(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (new TextEncoder().encode(value).byteLength > 16384)
    throw Error('Error log filters are too large');
  const filters = parseErrorLogColumnFilters(JSON.parse(value));
  for (const group of filters) {
    if (
      ['source', 'severity'].includes(group.field) &&
      group.constraints.some(
        (rule) =>
          !['equals', 'notEquals'].includes(rule.matchMode) ||
          !(
            group.field === 'source' ? ['api', 'job', 'web', 'mobile'] : ['warning', 'error']
          ).includes(String(rule.value)),
      )
    )
      throw Error('Invalid error log choice filter');
  }
  return JSON.stringify(filters);
}

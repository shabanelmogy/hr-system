import {
  parseGridFilters,
  type GridColumnFilter,
  type GridFilters,
} from '../../../../shared/data/public-api';

const textModes = [
  'contains',
  'notContains',
  'equals',
  'notEquals',
  'startsWith',
  'endsWith',
] as const;

export const globalTemplateColumnFilters = {
  title: {
    field: 'displayName',
    type: 'text',
    maxConstraints: 4,
    maxLength: 200,
    modes: textModes,
  },
  name: { field: 'reportKey', type: 'text', maxConstraints: 4, maxLength: 200, modes: textModes },
  entity: {
    field: 'entityKey',
    type: 'text',
    maxConstraints: 4,
    modes: ['equals', 'notEquals'],
    choices: ['countries', 'states', 'districts', 'system-error-logs'].map((value) => ({
      value,
      label: value,
    })),
  },
  version: {
    field: 'currentVersionNumber',
    type: 'number',
    maxConstraints: 4,
    numberMode: 'integer',
    minimum: 1,
    maximum: 2147483647,
  },
  updated: { field: 'updatedOn', type: 'date', maxConstraints: 4 },
  status: {
    field: 'status',
    type: 'text',
    maxConstraints: 4,
    modes: ['equals', 'notEquals'],
    choices: ['published', 'draft', 'archived'].map((value) => ({ value, label: value })),
  },
} satisfies Record<string, GridColumnFilter>;

export function parseGlobalTemplateFilters(value: unknown): GridFilters {
  return parseGridFilters(value, Object.values(globalTemplateColumnFilters));
}

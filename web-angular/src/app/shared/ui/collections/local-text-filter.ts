export const localTextOperators = [
  'contains',
  'notContains',
  'equals',
  'notEquals',
  'startsWith',
  'endsWith',
  'isEmpty',
  'isNotEmpty',
  'isAnyOf',
] as const;
export type LocalTextOperator = (typeof localTextOperators)[number];
export interface LocalTextFilter {
  readonly field: string;
  readonly operator: LocalTextOperator;
  readonly values: readonly string[];
}
export interface LocalTextColumn {
  readonly field: string;
  readonly label: string;
}
export const localTextValueLimit = 2000;
export const localTextListLimit = 100;
const searchCollator = new Intl.Collator(undefined, { sensitivity: 'base', usage: 'search' });

export function parseLocalTextFilter(
  value: unknown,
  fields: readonly string[],
): LocalTextFilter | null {
  if (value === null) return null;
  if (
    typeof value !== 'object' ||
    value === null ||
    !('field' in value) ||
    !('operator' in value) ||
    !('values' in value) ||
    typeof value.field !== 'string' ||
    !fields.includes(value.field) ||
    typeof value.operator !== 'string' ||
    !localTextOperators.some((operator) => operator === value.operator) ||
    !Array.isArray(value.values) ||
    value.values.length > localTextListLimit ||
    value.values.some(
      (item: unknown) => typeof item !== 'string' || item.length > localTextValueLimit,
    )
  )
    throw Error('Invalid local text filter.');
  const operator = value.operator as LocalTextOperator;
  if (operator === 'isEmpty' || operator === 'isNotEmpty')
    return { field: value.field, operator, values: [] };
  const values = (value.values as string[]).map((item) => item.trim()).filter(Boolean);
  if (!values.length) return null;
  if (operator !== 'isAnyOf' && values.length !== 1) throw Error('One filter value is required.');
  return { field: value.field, operator, values: [...new Set(values)] };
}

/** Text matching mirrors the source Grid without changing remote filter protocols. */
export function matchesLocalTextFilter(
  value: string | number | null | undefined,
  filter: LocalTextFilter,
): boolean {
  const text = value == null ? null : String(value);
  if (filter.operator === 'isEmpty') return text === null || text === '';
  if (filter.operator === 'isNotEmpty') return text !== null && text !== '';
  if (filter.operator === 'isAnyOf')
    return text !== null && filter.values.some((item) => searchCollator.compare(item, text) === 0);
  const expected = filter.values[0];
  if (expected === undefined) return true;
  const negative = filter.operator === 'notContains' || filter.operator === 'notEquals';
  if (text === null) return negative;
  if (filter.operator === 'equals' || filter.operator === 'notEquals') {
    const equal = searchCollator.compare(expected, text) === 0;
    return negative ? !equal : equal;
  }
  const actual = text.toLowerCase(),
    needle = expected.toLowerCase();
  if (filter.operator === 'startsWith') return actual.startsWith(needle);
  if (filter.operator === 'endsWith') return actual.endsWith(needle);
  const includes = actual.includes(needle);
  return negative ? !includes : includes;
}

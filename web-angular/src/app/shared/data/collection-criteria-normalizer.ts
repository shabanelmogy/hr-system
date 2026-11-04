import type {
  CollectionCriteria,
  CriteriaSort,
  CriteriaSearch,
  CriteriaFilter,
  CriteriaFilterPolicy,
  CollectionCriteriaPolicy,
} from './collection-criteria.types';
import { record, keys, text, freeze, sortKey } from './collection-criteria-values';

/** Pure normalization against the codec's copied, immutable policy. */
export function normalizeCriteria(
  value: unknown,
  policy: {
    readonly pageSizes: readonly number[];
    readonly sortFields: readonly string[];
    readonly searchPolicy: CollectionCriteriaPolicy['search'] | null;
    readonly filterPolicies: ReadonlyMap<string, CriteriaFilterPolicy>;
  },
): CollectionCriteria | null {
  const { pageSizes, sortFields, searchPolicy, filterPolicies } = policy;

  if (!record(value) || !keys(value, ['pageIndex', 'pageSize', 'sort', 'search', 'filters']))
    return null;
  if (
    typeof value['pageIndex'] !== 'number' ||
    !Number.isInteger(value['pageIndex']) ||
    value['pageIndex'] < 0 ||
    value['pageIndex'] > 100000 ||
    typeof value['pageSize'] !== 'number' ||
    !pageSizes.includes(value['pageSize'])
  )
    return null;
  let sort: CriteriaSort | null = null,
    search: CriteriaSearch | null = null;
  const rawSort = value['sort'];
  if (rawSort !== null) {
    if (
      !record(rawSort) ||
      !keys(rawSort, ['field', 'direction']) ||
      typeof rawSort['field'] !== 'string' ||
      !sortFields.includes(rawSort['field']) ||
      (rawSort['direction'] !== 'asc' && rawSort['direction'] !== 'desc')
    )
      return null;
    sort = { field: rawSort['field'], direction: rawSort['direction'] };
  }
  const rawSearch = value['search'];
  if (rawSearch !== null) {
    if (
      !searchPolicy ||
      !record(rawSearch) ||
      !keys(rawSearch, ['field', 'operator', 'value']) ||
      typeof rawSearch['field'] !== 'string' ||
      !searchPolicy.fields.includes(rawSearch['field']) ||
      typeof rawSearch['operator'] !== 'string' ||
      !searchPolicy.operators.includes(rawSearch['operator']) ||
      !text(rawSearch['value'], searchPolicy.maxLength)
    )
      return null;
    search = {
      field: rawSearch['field'],
      operator: rawSearch['operator'],
      value: rawSearch['value'],
    };
  }
  const rawFilters = value['filters'];
  if (!Array.isArray(rawFilters) || rawFilters.length > 8) return null;
  const filters: CriteriaFilter[] = [],
    seen = new Set<string>();
  for (const raw of rawFilters as readonly unknown[]) {
    if (
      !record(raw) ||
      !keys(raw, ['field', 'operator', 'value']) ||
      typeof raw['field'] !== 'string' ||
      typeof raw['operator'] !== 'string'
    )
      return null;
    const policy = filterPolicies.get(raw['field']);
    if (!policy || !policy.operators.includes(raw['operator'])) return null;
    const item = raw['value'];
    if (item === null) {
      if (!policy.nullable) return null;
    } else if (policy.kind === 'string') {
      if (!text(item, policy.maxLength ?? 128)) return null;
    } else if (policy.kind === 'boolean') {
      if (typeof item !== 'boolean') return null;
    } else if (
      typeof item !== 'number' ||
      !Number.isSafeInteger(item) ||
      item < (policy.min ?? Number.MIN_SAFE_INTEGER) ||
      item > (policy.max ?? Number.MAX_SAFE_INTEGER)
    )
      return null;
    const filter: CriteriaFilter = {
        field: raw['field'],
        operator: raw['operator'],
        value: item,
      },
      key = sortKey(filter);
    if (seen.has(key)) return null;
    seen.add(key);
    filters.push(filter);
  }
  filters.sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : sortKey(a) > sortKey(b) ? 1 : 0));
  const result = {
    pageIndex: value['pageIndex'],
    pageSize: value['pageSize'],
    sort,
    search,
    filters,
  };
  const serialized = JSON.stringify({ v: 1, ...result });
  if (serialized.length > 2048 || encodeURIComponent(serialized).length > 8192) return null;
  return freeze(result);
}

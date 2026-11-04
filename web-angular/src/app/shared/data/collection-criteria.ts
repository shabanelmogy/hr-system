import type {
  CollectionCriteria,
  CollectionCriteriaPolicy,
  CriteriaResolution,
  CollectionCriteriaCodec,
} from './collection-criteria.types';
export type {
  CriteriaSort,
  CriteriaSearch,
  CriteriaScalar,
  CriteriaFilter,
  CollectionCriteria,
  CriteriaFilterPolicy,
  CollectionCriteriaPolicy,
  CriteriaResolution,
  CollectionCriteriaCodec,
} from './collection-criteria.types';
import { record, keys, name, names, boundedLength, freeze } from './collection-criteria-values';
import { normalizeCriteria } from './collection-criteria-normalizer';

/** Optional opt-in URL policy, never inferred from a DTO, auth context or API wire format. */
export function createCollectionCriteriaCodec(
  input: CollectionCriteriaPolicy,
): CollectionCriteriaCodec {
  const bad = () => {
    throw new Error('Invalid collection criteria URL policy');
  };
  if (
    !Array.isArray(input.pageSizes) ||
    input.pageSizes.length < 1 ||
    input.pageSizes.length > 8 ||
    new Set(input.pageSizes).size !== input.pageSizes.length ||
    !input.pageSizes.every((size) => Number.isInteger(size) && size >= 1 && size <= 1000) ||
    !input.pageSizes.includes(input.defaultPageSize)
  )
    bad();
  if (
    !Array.isArray(input.sortFields) ||
    input.sortFields.length > 16 ||
    new Set(input.sortFields).size !== input.sortFields.length ||
    !input.sortFields.every(name)
  )
    bad();
  if (
    input.defaultSort &&
    (!input.sortFields.includes(input.defaultSort.field) ||
      !['asc', 'desc'].includes(input.defaultSort.direction))
  )
    bad();
  if (
    input.search &&
    (input.search.url !== 'approved-public' ||
      !names(input.search.fields) ||
      !names(input.search.operators) ||
      !boundedLength(input.search.maxLength))
  )
    bad();
  if (
    !Array.isArray(input.filters) ||
    input.filters.length > 16 ||
    new Set(input.filters.map((f: unknown) => (record(f) ? f['field'] : null))).size !==
      input.filters.length
  )
    bad();
  for (const field of input.filters) {
    if (
      !name(field.field) ||
      field.url !== 'approved-public' ||
      !names(field.operators) ||
      !['string', 'boolean', 'integer'].includes(field.kind) ||
      typeof field.nullable !== 'boolean'
    )
      bad();
    if (
      field.maxLength !== undefined &&
      (field.kind !== 'string' || !boundedLength(field.maxLength))
    )
      bad();
    if (
      (field.min !== undefined || field.max !== undefined) &&
      (field.kind !== 'integer' ||
        (field.min !== undefined && !Number.isSafeInteger(field.min)) ||
        (field.max !== undefined && !Number.isSafeInteger(field.max)) ||
        (field.min !== undefined && field.max !== undefined && field.min > field.max))
    )
      bad();
  }
  // Copy the policy so a later caller mutation cannot weaken an active codec.
  const pageSizes = [...input.pageSizes],
    sortFields = [...input.sortFields],
    searchPolicy = input.search
      ? {
          ...input.search,
          fields: [...input.search.fields],
          operators: [...input.search.operators],
        }
      : null;
  const filterPolicies = new Map(
    input.filters.map((f) => [f.field, { ...f, operators: [...f.operators] }]),
  );
  const defaults = freeze({
    pageIndex: 0,
    pageSize: input.defaultPageSize,
    sort: input.defaultSort ? { ...input.defaultSort } : null,
    search: null,
    filters: [],
  });
  const normalizationPolicy = { pageSizes, sortFields, searchPolicy, filterPolicies };
  const normalize = (value: unknown) => normalizeCriteria(value, normalizationPolicy);
  const criteriaKey = (value: CollectionCriteria) =>
    JSON.stringify([value.sort, value.search, value.filters]);
  function encode(value: unknown): string | null {
    const normalized = normalize(value);
    if (!normalized) return null;
    const result = JSON.stringify({ v: 1, ...normalized });
    return result.length <= 2048 && encodeURIComponent(result).length <= 8192 ? result : null;
  }
  function decode(raw: string | null): CriteriaResolution {
    const fail = (reason: CriteriaResolution['reason']): CriteriaResolution => ({
      value: defaults,
      valid: false,
      reason,
    });
    if (raw === null) return { value: defaults, valid: true, reason: null };
    if (raw.length > 2048) return fail('oversized');
    try {
      if (encodeURIComponent(raw).length > 8192) return fail('oversized');
      const parsed: unknown = JSON.parse(raw);
      if (
        !record(parsed) ||
        !keys(parsed, ['v', 'pageIndex', 'pageSize', 'sort', 'search', 'filters']) ||
        parsed['v'] !== 1
      )
        return fail('schema');
      const { v: _version, ...value } = parsed;
      const result = normalize(value);
      return result ? { value: result, valid: true, reason: null } : fail('schema');
    } catch {
      return fail('malformed');
    }
  }
  function change(
    current: CollectionCriteria,
    patch: Partial<CollectionCriteria>,
  ): CollectionCriteria | null {
    const next = normalize({ ...current, ...patch });
    if (!next) return null;
    const changed =
      next.pageSize !== current.pageSize || criteriaKey(next) !== criteriaKey(current);
    const candidate = changed ? freeze({ ...next, pageIndex: 0 }) : next;
    return encode(candidate) === null ? null : candidate;
  }
  return Object.freeze({ defaults, normalize, decode, encode, criteriaKey, change });
}

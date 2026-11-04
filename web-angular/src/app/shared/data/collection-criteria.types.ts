export interface CriteriaSort {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

export interface CriteriaSearch {
  readonly field: string;
  readonly operator: string;
  readonly value: string;
}

export type CriteriaScalar = string | number | boolean | null;

export interface CriteriaFilter {
  readonly field: string;
  readonly operator: string;
  readonly value: CriteriaScalar;
}

export interface CollectionCriteria {
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly sort: CriteriaSort | null;
  readonly search: CriteriaSearch | null;
  readonly filters: readonly CriteriaFilter[];
}

export interface CriteriaFilterPolicy {
  readonly field: string;
  readonly url: 'approved-public';
  readonly operators: readonly string[];
  readonly kind: 'string' | 'boolean' | 'integer';
  readonly nullable: boolean;
  readonly maxLength?: number;
  readonly min?: number;
  readonly max?: number;
}

export interface CollectionCriteriaPolicy {
  readonly pageSizes: readonly number[];
  readonly defaultPageSize: number;
  readonly sortFields: readonly string[];
  readonly defaultSort: CriteriaSort | null;
  readonly search?: {
    readonly url: 'approved-public';
    readonly fields: readonly string[];
    readonly operators: readonly string[];
    readonly maxLength: number;
  };
  readonly filters: readonly CriteriaFilterPolicy[];
}

export interface CriteriaResolution {
  readonly value: CollectionCriteria;
  readonly valid: boolean;
  readonly reason: 'malformed' | 'schema' | 'oversized' | null;
}

export interface CollectionCriteriaCodec {
  readonly defaults: CollectionCriteria;
  normalize(input: unknown): CollectionCriteria | null;
  decode(raw: string | null): CriteriaResolution;
  encode(input: unknown): string | null;
  criteriaKey(value: CollectionCriteria): string;
  change(
    current: CollectionCriteria,
    patch: Partial<CollectionCriteria>,
  ): CollectionCriteria | null;
}

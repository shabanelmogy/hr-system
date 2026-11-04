import type { CollectionCriteria, CriteriaFilter } from './collection-criteria.types';
export const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

export const keys = (value: Record<string, unknown>, expected: readonly string[]) =>
  Object.keys(value).length === expected.length &&
  expected.every((key) => Object.hasOwn(value, key));

export const name = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(value) &&
  !['constructor', 'prototype'].includes(value);

export const names = (values: readonly string[]) =>
  Array.isArray(values) &&
  values.length > 0 &&
  values.length <= 16 &&
  new Set(values).size === values.length &&
  values.every(name);

export const boundedLength = (value: number) =>
  Number.isInteger(value) && value >= 1 && value <= 128;

export const text = (value: unknown, max: number): value is string =>
  typeof value === 'string' &&
  value.length <= max &&
  [...value].every(
    (character) => character.charCodeAt(0) > 31 && character.charCodeAt(0) !== 127,
  ) &&
  !/\p{Surrogate}/u.test(value);

export const sortKey = (value: CriteriaFilter) => value.field + '\0' + value.operator;

export function freeze(value: CollectionCriteria): CollectionCriteria {
  if (value.sort) Object.freeze(value.sort);
  if (value.search) Object.freeze(value.search);
  value.filters.forEach(Object.freeze);
  Object.freeze(value.filters);
  return Object.freeze(value);
}

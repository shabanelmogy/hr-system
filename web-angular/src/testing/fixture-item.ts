/** Require a fixture entry explicitly so a missing sample fails at its source. */
export function fixtureItem<T>(values: ArrayLike<T>, index: number): T {
  const value = values[index];
  if (value === undefined) throw new Error(`Missing fixture item at index ${index}`);
  return value;
}

export function fixtureArray(value: unknown): readonly unknown[] {
  if (!Array.isArray(value)) throw new Error('Fixture value must be an array');
  return value;
}

export function fixtureBuffer(value: unknown): ArrayBuffer {
  if (!(value instanceof ArrayBuffer)) throw new Error('Fixture value must be an ArrayBuffer');
  return value;
}

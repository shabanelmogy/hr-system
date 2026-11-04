/** Format supported scalar values without exposing accidental object stringification. */
export function scalarText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint')
    return String(value);
  if (value instanceof Date) return value.toString();
  return fallback;
}

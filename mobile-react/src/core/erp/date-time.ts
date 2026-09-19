declare const dateOnlyBrand: unique symbol;
declare const utcInstantBrand: unique symbol;
export type DateOnlyString = string & { readonly [dateOnlyBrand]: true };
export type UtcInstantString = string & { readonly [utcInstantBrand]: true };

export function parseDateOnly(value: string): DateOnlyString {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Date-only values must use YYYY-MM-DD.');
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error('The date-only value is not a valid calendar date.');
  }
  return value as DateOnlyString;
}

export function parseUtcInstant(value: string): UtcInstantString {
  if (!value.endsWith('Z') || !Number.isFinite(Date.parse(value))) {
    throw new Error('UTC instants must be valid ISO-8601 values ending in Z.');
  }
  return new Date(value).toISOString() as UtcInstantString;
}

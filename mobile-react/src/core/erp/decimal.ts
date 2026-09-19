declare const decimalBrand: unique symbol;
export type DecimalString = string & { readonly [decimalBrand]: true };

const DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

export function parseDecimalString(value: string, maxScale = 6): DecimalString {
  const normalized = value.trim();
  if (!DECIMAL_PATTERN.test(normalized)) throw new Error('A canonical decimal string is required.');
  const scale = normalized.split('.')[1]?.length ?? 0;
  if (scale > maxScale) throw new Error(`Decimal scale must not exceed ${maxScale}.`);
  return normalized as DecimalString;
}

export function decimalFromNumber(value: number, maxScale = 6): DecimalString {
  if (!Number.isFinite(value)) throw new Error('A finite decimal value is required.');
  return parseDecimalString(String(value), maxScale);
}

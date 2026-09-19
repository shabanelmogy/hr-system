import { parseDecimalString, type DecimalString } from './decimal';

export interface QuantityValue {
  value: DecimalString;
  unitCode: string;
}

export function createQuantity(value: string, unitCode: string, maxScale = 6): QuantityValue {
  const normalizedUnit = unitCode.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9._-]{0,15}$/.test(normalizedUnit)) throw new Error('A canonical unit code is required.');
  return { value: parseDecimalString(value, maxScale), unitCode: normalizedUnit };
}

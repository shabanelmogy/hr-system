import { decimalFromNumber, parseDecimalString, type DecimalString } from './decimal';

export interface MoneyValue {
  amount: DecimalString;
  currencyCode: string;
}

export function createMoney(amount: string | number, currencyCode: string, maxScale = 4): MoneyValue {
  const normalizedCurrency = currencyCode.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalizedCurrency)) throw new Error('An ISO 4217 currency code is required.');
  return {
    amount: typeof amount === 'number'
      ? decimalFromNumber(amount, maxScale)
      : parseDecimalString(amount, maxScale),
    currencyCode: normalizedCurrency,
  };
}

export function formatMoney(value: MoneyValue, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currencyCode,
    maximumFractionDigits: Math.max(2, value.amount.split('.')[1]?.length ?? 0),
  }).format(Number(value.amount));
}

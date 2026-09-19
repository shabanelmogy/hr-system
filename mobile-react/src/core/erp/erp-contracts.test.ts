import { createMoney, createQuantity, formatMoney, parseDateOnly, parseDecimalString, parseUtcInstant } from '.';

describe('ERP primitive contracts', () => {
  it('keeps decimal wire values canonical and bounded by scale', () => {
    expect(parseDecimalString('1234567890.1250', 4)).toBe('1234567890.1250');
    expect(() => parseDecimalString('1e3')).toThrow();
    expect(() => parseDecimalString('1.234', 2)).toThrow();
  });

  it('validates currency, quantity units, date-only and UTC boundaries', () => {
    expect(createMoney('12.50', 'egp')).toEqual({ amount: '12.50', currencyCode: 'EGP' });
    expect(formatMoney(createMoney('12.50', 'EGP'), 'en-US')).toContain('12.50');
    expect(createQuantity('4.25', 'kg')).toEqual({ value: '4.25', unitCode: 'KG' });
    expect(parseDateOnly('2028-02-29')).toBe('2028-02-29');
    expect(() => parseDateOnly('2027-02-29')).toThrow();
    expect(parseUtcInstant('2026-09-19T12:30:00Z')).toBe('2026-09-19T12:30:00.000Z');
    expect(() => parseUtcInstant('2026-09-19T12:30:00+02:00')).toThrow();
  });
});

import { dateOnlyErrors,dateOnlyToLocal,isDateOnly,localToDateOnly,normalizeDateDigits } from './date-only';
describe('Date-only values',()=>{
 it('validates Gregorian calendar and full DateOnly year boundaries without rollover',()=>{
  for(const value of ['0001-01-01','0099-12-31','1900-02-28','2000-02-29','2024-02-29','9999-12-31'])expect(isDateOnly(value),value).toBe(true);
  for(const value of ['0000-01-01','10000-01-01','1900-02-29','2100-02-29','2024-02-30','2024-04-31','2024-00-10','2024-13-10','2024-01-00','24-02-29','2024-2-29','2024-02-29T00:00:00Z',' 2024-02-29',null,{},new Date()])expect(isDateOnly(value),String(value)).toBe(false);
 });
 it('keeps empty values optional and rejects malformed, reversed and out-of-range bounds',()=>{
  for(const value of ['',null,undefined])expect(dateOnlyErrors(value)).toBeNull();
  expect(dateOnlyErrors('2024-02-')).toEqual({dateOnly:true});
  expect(dateOnlyErrors('2024-02-29','2024-02-29','2024-02-29')).toBeNull();
  expect(dateOnlyErrors('2024-03-01','2024-02-01','2024-02-29')).toHaveProperty('dateRange');
  expect(dateOnlyErrors('','bad')).toHaveProperty('dateBounds');expect(dateOnlyErrors('','2025-01-01','2024-01-01')).toHaveProperty('dateBounds');
 });
 it('adapts local components silently without Date.parse, UTC or years0..99 remapping',()=>{
  for(const value of ['0001-01-01','0099-12-31','2024-02-29','2026-03-08','2026-11-01','9999-12-31']){const local=dateOnlyToLocal(value);expect(local?.getHours()).toBe(12);expect(localToDateOnly(local)).toBe(value);}
  expect(dateOnlyToLocal('2024-02-30')).toBeNull();expect(localToDateOnly(new Date(NaN))).toBeNull();expect(localToDateOnly('2024-02-29')).toBeNull();
 });
 it('normalizes Arabic and Persian digits without accepting ambiguous separators or trimming',()=>{
  expect(normalizeDateDigits('٢٠٢٤-٠٢-٢٩')).toBe('2024-02-29');expect(normalizeDateDigits('۲۰۲۴-۰۲-۲۹')).toBe('2024-02-29');expect(normalizeDateDigits(' ٢٠٢٤/٠٢/٢٩')).toBe(' 2024/02/29');
 });
});

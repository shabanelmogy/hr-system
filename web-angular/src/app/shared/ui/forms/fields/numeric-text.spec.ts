import { compareNumericText,normalizeNumericText,numericTextErrors } from './numeric-text';
describe('Exact numeric text',()=>{
 it('compares unsafe integers and deep decimal places without rounding',()=>{
  expect(compareNumericText('9007199254740993','9007199254740992')).toBe(1);
  expect(compareNumericText('0.10000000000000001','0.1')).toBe(1);
  expect(compareNumericText('-9007199254740993','-9007199254740992')).toBe(-1);
  expect(compareNumericText('0001.23000','1.23')).toBe(0);expect(compareNumericText('-0.000','0')).toBe(0);
  expect(compareNumericText('-0.0000000000001','0')).toBe(-1);expect(compareNumericText('99','100')).toBe(-1);
  expect(compareNumericText('1.1','1.09')).toBe(1);expect(compareNumericText('-1.09','-1.1')).toBe(1);
 });
 it('retains complete invariant strings and rejects partial/ambiguous/untrusted values',()=>{
  for(const value of ['0','-0','001.2300','9007199254740993','1234567890.1234567890','-99.001'])expect(numericTextErrors(value),value).toBeNull();
  for(const value of ['-','.','1.','.5','+1','1e3','NaN','Infinity','1,23','1,234','1٬234',' 1','1 ','1\n','1_000',{},1,NaN])expect(numericTextErrors(value),String(value)).toHaveProperty('numericText');
  for(const value of ['',null,undefined])expect(numericTextErrors(value)).toBeNull();expect(compareNumericText('1.','1')).toBeNull();
 });
 it('normalizes only approved digits/decimal/minus and keeps invalid grouping visible',()=>{
  expect(normalizeNumericText('−٠٠١٢٫٣٤٠٠')).toBe('-0012.3400');expect(normalizeNumericText('۱۲۳٫۴۵')).toBe('123.45');expect(normalizeNumericText('١٬٢٣٤,٥٦')).toBe('1٬234,56');
 });
 it('enforces independent scale and meaningful integer precision without clamping',()=>{
  expect(numericTextErrors('00012.3400',{maxIntegerDigits:2,maxFractionDigits:4})).toBeNull();
  expect(numericTextErrors('000.00',{maxIntegerDigits:1})).toBeNull();expect(numericTextErrors('123',{maxIntegerDigits:2})).toHaveProperty('numericPrecision');
  expect(numericTextErrors('1.00',{maxFractionDigits:1})).toHaveProperty('numericScale');expect(numericTextErrors('1.0',{maxFractionDigits:0})).toHaveProperty('numericScale');
  expect(numericTextErrors('1.0',{mode:'integer'})).toHaveProperty('numericInteger');expect(numericTextErrors('-1',{mode:'integer'})).toBeNull();
 });
 it('checks inclusive bounds at exact precision and signed zero',()=>{
  expect(numericTextErrors('9007199254740993',{min:'9007199254740993',max:'9007199254740993'})).toBeNull();
  expect(numericTextErrors('9007199254740992',{min:'9007199254740993'})).toHaveProperty('numericRange');
  expect(numericTextErrors('0.10000000000000001',{max:'0.1'})).toHaveProperty('numericRange');
  expect(numericTextErrors('-0.000',{min:'0',max:'0'})).toBeNull();expect(numericTextErrors('-0.1',{min:'0'})).toHaveProperty('numericRange');
 });
 it('fails closed on invalid settings and bounds even when empty',()=>{
  for(const settings of [{min:'1.',max:null},{min:'2',max:'1'},{min:'NaN'},{maxIntegerDigits:0},{maxIntegerDigits:NaN},{maxFractionDigits:-1},{maxFractionDigits:1.5},{maxFractionDigits:513}])expect(numericTextErrors('',settings)).toHaveProperty('numericConfig');
 });
 it('has bounded parser capacity while preserving arbitrary precision within capacity',()=>{
  expect(numericTextErrors('9'.repeat(512))).toBeNull();expect(numericTextErrors('9'.repeat(513))).toHaveProperty('numericCapacity');expect(compareNumericText('9'.repeat(512),'8'.repeat(512))).toBe(1);expect(compareNumericText('9'.repeat(513),'0')).toBeNull();
 });
});

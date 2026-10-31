import { parseGridFilters,type GridColumnFilter } from './grid-filter.types';
import { fromPrimeGridFilters,toPrimeGridFilters,setPrimeGridFilterDraft } from './grid-filter-adapter';
const definitions:readonly GridColumnFilter[]=[{field:'name',type:'text',maxLength:3,maxConstraints:3},{field:'amount',type:'number'},{field:'day',type:'date'},{field:'enabled',type:'boolean'}];
describe('Typed shared Grid advanced criteria boundary',()=>{
 it('enforces owner-defined integer bounds and valid calendar years without changing zero',()=>{
  const integer:GridColumnFilter={field:'id',type:'number',numberMode:'integer',minimum:0,maximum:2147483647};
  const group=(value:unknown)=>[{field:'id',operator:'and',constraints:[{matchMode:'equals',value}]}];
  expect(parseGridFilters(group(0),[integer])[0].constraints[0].value).toBe(0);
  for(const value of [-1,0.5,2147483648,Number.NaN,Number.POSITIVE_INFINITY,'0'])expect(()=>parseGridFilters(group(value),[integer])).toThrow();
  expect(()=>parseGridFilters([],[{...integer,minimum:5,maximum:4}])).toThrow();
  expect(()=>parseGridFilters([{field:'day',operator:'and',constraints:[{matchMode:'dateIs',value:'0000-01-01'}]}],definitions)).toThrow();
 });
 it('preserves false/zero,AND/OR,dates and independent fields without mutating the owner',()=>{
  const source=parseGridFilters([{field:'name',operator:'or',constraints:[{matchMode:'startsWith',value:'A'},{matchMode:'endsWith',value:'Z'}]},{field:'amount',operator:'and',constraints:[{matchMode:'gte',value:0}]},{field:'enabled',operator:'and',constraints:[{matchMode:'equals',value:false}]},{field:'day',operator:'and',constraints:[{matchMode:'dateIs',value:'2024-02-29'}]}],definitions);
  const vendor=toPrimeGridFilters(source,definitions);expect(fromPrimeGridFilters(vendor,definitions)).toEqual(source);
  vendor['name'][0].value='B';expect(source[0].constraints[0].value).toBe('A');expect(Object.isFrozen(source[0].constraints[0])).toBe(true);
  setPrimeGridFilterDraft(vendor['amount'][0],25);expect(vendor['amount'][0].value).toBe(25);expect(source[1].constraints[0].value).toBe(0);
 });
 it('rejects the complete unsupported/oversized/malformed contract instead of ignoring a rule',()=>{
  const rule={field:'name',operator:'and',constraints:[{matchMode:'contains',value:'ABC'}]};
  for(const invalid of [[{...rule,field:'unknown'}],[rule,rule],[{...rule,operator:'xor'}],[{...rule,constraints:[{matchMode:'gt',value:'A'}]}],[{...rule,constraints:[{matchMode:'contains',value:'ABCD'}]}],[{field:'day',operator:'and',constraints:[{matchMode:'dateIs',value:'2023-02-29'}]}],[{field:'amount',operator:'and',constraints:[{matchMode:'gte',value:Infinity}]}],[{...rule,ignored:true}]])expect(()=>parseGridFilters(invalid,definitions)).toThrow();
  expect(()=>parseGridFilters([],[{field:'constructor',type:'text'}])).toThrow();
  expect(()=>parseGridFilters([],[{field:'amount',type:'number',modes:['contains']}])).toThrow();
 });
 it('omits empty native slots but rejects unknown fields,mixed operators and invalid dates',()=>{
  expect(fromPrimeGridFilters(toPrimeGridFilters([],definitions),definitions)).toEqual([]);
  expect(()=>fromPrimeGridFilters({unknown:[]},definitions)).toThrow();
  expect(()=>fromPrimeGridFilters({name:[{value:'A',matchMode:'contains',operator:'and'},{value:'B',matchMode:'contains',operator:'or'}]},definitions)).toThrow();
  expect(()=>fromPrimeGridFilters({day:[{value:new Date(NaN),matchMode:'dateIs',operator:'and'}]},definitions)).toThrow();
 });
});

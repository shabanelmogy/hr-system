import { filterByCellValue } from './grid-cell-filter';
import type { GridColumnFilter,GridFilters } from './grid-filter.types';
describe('Shared exact cell-value filter',()=>{
 const definitions:readonly GridColumnFilter[]=[{field:'name',type:'text'},{field:'amount',type:'number'},{field:'enabled',type:'boolean'},{field:'day',type:'date'}];
 it('replaces only the chosen column and preserves independent AND/OR rules without mutation',()=>{
  const before:GridFilters=[{field:'name',operator:'or',constraints:[{matchMode:'contains',value:'old'},{matchMode:'endsWith',value:'end'}]},{field:'amount',operator:'and',constraints:[{matchMode:'gte',value:5}]}];
  expect(filterByCellValue(before,definitions,'name','new')).toEqual([{field:'name',operator:'and',constraints:[{matchMode:'equals',value:'new'}]},before[1]]);expect(before[0].operator).toBe('or');
 });
 it('keeps zero and false as typed values and uses calendar dateIs without locale guessing',()=>{
  expect(filterByCellValue([],definitions,'amount',0)?.[0].constraints[0]).toEqual({matchMode:'equals',value:0});
  expect(filterByCellValue([],definitions,'enabled',false)?.[0].constraints[0]).toEqual({matchMode:'equals',value:false});
  expect(filterByCellValue([],definitions,'day','2024-02-29')?.[0].constraints[0]).toEqual({matchMode:'dateIs',value:'2024-02-29'});
 });
 it('rejects missing/blank/unsupported values and an owner that disallows exact matching',()=>{
  for(const value of [null,undefined,'',{},['a']])expect(filterByCellValue([],definitions,'name',value)).toBeNull();
  for(const value of ['2/3/2024','2023-02-29','2024-01-01T12:00:00Z'])expect(filterByCellValue([],definitions,'day',value)).toBeNull();
  expect(filterByCellValue([],[{field:'name',type:'text',modes:['contains']}],'name','x')).toBeNull();
  expect(filterByCellValue([],definitions,'missing','x')).toBeNull();expect(filterByCellValue([],definitions,'amount','0')).toBeNull();
 });
 it('does not bypass malformed existing criteria or owner limits',()=>{
  expect(filterByCellValue([{field:'missing',operator:'and',constraints:[{matchMode:'equals',value:1}]}],definitions,'name','x')).toBeNull();
  expect(filterByCellValue([],[{field:'name',type:'text',maxLength:2}],'name','long')).toBeNull();
 });
});

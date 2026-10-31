import { countryColumnFilters,countryColumnFilterPatch } from './country-column-filters';
import { defaultCountryQuery } from '../types/country';
describe('Countries native structured filters',()=>{
 it('preserves independent toolbar criteria and multiple fields/AND/OR rules without dropping a condition',()=>{
  const filters=[{field:'nameEn',operator:'or',constraints:[{matchMode:'contains',value:'Egypt'},{matchMode:'contains',value:'Sudan'}]},{field:'id',operator:'and',constraints:[{matchMode:'gte',value:0}]}];
  const patch=countryColumnFilterPatch(filters);expect(patch?.filters).toHaveLength(2);expect(patch?.filters?.find(group=>group.field==='nameEn')?.constraints).toHaveLength(2);
  expect(countryColumnFilters({...defaultCountryQuery,search:'Independent toolbar',...patch})).toEqual(patch?.filters);expect(defaultCountryQuery.search).toBe('');
 });
 it('keeps false/zero and clears structured filters without changing the toolbar contract',()=>{
  const patch=countryColumnFilterPatch([{field:'isDeleted',operator:'and',constraints:[{matchMode:'equals',value:false}]},{field:'statesCount',operator:'and',constraints:[{matchMode:'gte',value:0}]}]);
  expect(patch?.filters?.map(group=>group.constraints[0].value)).toEqual([0,false]);expect(countryColumnFilterPatch([])).toEqual({filters:[]});expect(countryColumnFilters(defaultCountryQuery)).toEqual([]);
 });
 it('rejects unknown fields, type mismatches, fractional IDs, excessive rules and invalid calendar dates as a whole',()=>{
  for(const filters of [[{field:'unknown',operator:'and',constraints:[{matchMode:'equals',value:1}]}],[{field:'id',operator:'and',constraints:[{matchMode:'equals',value:1.5}]}],[{field:'isDeleted',operator:'and',constraints:[{matchMode:'equals',value:0}]}],[{field:'createdOn',operator:'and',constraints:[{matchMode:'dateIs',value:'2026-02-30'}]}],[{field:'nameEn',operator:'and',constraints:Array.from({length:5},()=>({matchMode:'contains',value:'A'}))}]])expect(countryColumnFilterPatch(filters)).toBeNull();
 });
});

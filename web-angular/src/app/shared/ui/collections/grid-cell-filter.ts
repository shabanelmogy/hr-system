import { filterValueValid,gridFilterModes,parseGridFilters,type GridColumnFilter,type GridFilterConstraint,type GridFilters } from './grid-filter.types';

export function exactCellConstraint(value:unknown,definition:GridColumnFilter):GridFilterConstraint|null{
 const mode=definition.type==='date'?'dateIs':'equals';
 if(!(definition.modes??gridFilterModes[definition.type]).includes(mode)||!filterValueValid(value,definition))return null;
 return {matchMode:mode,value};
}
/** Replace this column only; all other owner criteria remain controlled and intact. */
export function filterByCellValue(filters:GridFilters,definitions:readonly GridColumnFilter[],field:string,value:unknown):GridFilters|null{
 try{
  const current=parseGridFilters(filters,definitions),definition=definitions.find(item=>item.field===field);if(!definition)return null;
  const constraint=exactCellConstraint(value,definition);if(!constraint)return null;
  return parseGridFilters([...current.filter(group=>group.field!==field),{field,operator:'and',constraints:[constraint]}],definitions);
 }catch{return null;}
}

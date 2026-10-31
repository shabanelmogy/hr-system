import { gridFilterModes,parseGridFilters,type GridColumnFilter,type GridFilters } from './grid-filter.types';
interface VendorConstraint {value:unknown;matchMode:string;operator:string;}
export type PrimeGridFilters=Record<string,VendorConstraint[]>;
/** The native custom-template callback applies immediately. Update only its isolated draft instead. */
export function setPrimeGridFilterDraft(constraint:unknown,value:unknown):void{
 if(typeof constraint==='object'&&constraint!==null&&'value'in constraint)constraint.value=value;
}
/** Create a fresh mutable vendor copy; PrimeNG must never mutate owner criteria. */
export function toPrimeGridFilters(value:GridFilters,definitions:readonly GridColumnFilter[]):PrimeGridFilters{
 const filters=parseGridFilters(value,definitions),result:PrimeGridFilters={};
 for(const definition of definitions){const group=filters.find(item=>item.field===definition.field);
  result[definition.field]=group?group.constraints.map(rule=>({value:definition.type==='date'?new Date(String(rule.value)+'T12:00:00'):rule.value,matchMode:rule.matchMode,operator:group.operator})):[{value:null,matchMode:(definition.modes??gridFilterModes[definition.type])[0],operator:'and'}];
 }
 return result;
}
/** Ignore empty vendor slots, while invalid nonempty values reject the complete event. */
export function fromPrimeGridFilters(value:unknown,definitions:readonly GridColumnFilter[]):GridFilters{
 if(typeof value!=='object'||value===null||Array.isArray(value))throw Error('Invalid vendor filters');
 const groups=[];
 for(const [field,metadata]of Object.entries(value)){
  if(!definitions.some(item=>item.field===field))throw Error('Unsupported vendor filter field');
  const entries=Array.isArray(metadata)?metadata:[metadata];
  if(entries.length>8)throw Error('Too many vendor constraints');
  let operator:unknown=null;const constraints=[];
  for(const entry of entries){
   if(typeof entry!=='object'||entry===null||!('value'in entry)||!('matchMode'in entry)||!('operator'in entry))throw Error('Invalid vendor constraint');
   if(entry.value===null||entry.value===undefined||entry.value==='')continue;
   if(operator!==null&&operator!==entry.operator)throw Error('Mixed filter operators');operator=entry.operator;
   let ruleValue:unknown=entry.value;
   if(ruleValue instanceof Date){if(!Number.isFinite(ruleValue.getTime()))throw Error('Invalid date filter');ruleValue=[String(ruleValue.getFullYear()).padStart(4,'0'),String(ruleValue.getMonth()+1).padStart(2,'0'),String(ruleValue.getDate()).padStart(2,'0')].join('-');}
   constraints.push({matchMode:entry.matchMode,value:ruleValue});
  }
  if(constraints.length)groups.push({field,operator,constraints});
 }
 return parseGridFilters(groups,definitions);
}

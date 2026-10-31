/** Public vendor-independent filter contract. All fields are explicitly supplied by an owner. */
export type GridFilterType='text'|'number'|'date'|'boolean';
export type GridFilterMode='startsWith'|'contains'|'notContains'|'endsWith'|'equals'|'notEquals'|'lt'|'lte'|'gt'|'gte'|'dateIs'|'dateIsNot'|'dateBefore'|'dateAfter';
export type GridFilterValue=string|number|boolean;
export interface GridColumnFilter {
 readonly field:string;readonly type:GridFilterType;readonly modes?:readonly GridFilterMode[];
 readonly maxConstraints?:number;readonly maxLength?:number;
 readonly numberMode?:'decimal'|'integer';readonly minimum?:number;readonly maximum?:number;
}
export interface GridFilterConstraint {readonly matchMode:GridFilterMode;readonly value:GridFilterValue;}
export interface GridFilterGroup {readonly field:string;readonly operator:'and'|'or';readonly constraints:readonly GridFilterConstraint[];}
export type GridFilters=readonly GridFilterGroup[];
export const gridFilterModes:Readonly<Record<GridFilterType,readonly GridFilterMode[]>>=Object.freeze({
 text:['startsWith','contains','notContains','endsWith','equals','notEquals'],
 number:['equals','notEquals','lt','lte','gt','gte'],
 date:['dateIs','dateIsNot','dateBefore','dateAfter'],boolean:['equals','notEquals'],
});
export const gridFilterLimits=Object.freeze({fields:32,constraints:8,text:2000});
export function filterDefinitionValid(definition:GridColumnFilter):boolean{
 const modes=gridFilterModes[definition.type];
 return !!modes&&/^[A-Za-z_][A-Za-z0-9_.]{0,79}$/.test(definition.field)&&!['__proto__','prototype','constructor'].includes(definition.field)
  &&(definition.modes===undefined||definition.modes.length>0&&new Set(definition.modes).size===definition.modes.length&&definition.modes.every(mode=>modes.includes(mode)))
  &&(definition.maxConstraints===undefined||Number.isInteger(definition.maxConstraints)&&definition.maxConstraints>=1&&definition.maxConstraints<=gridFilterLimits.constraints)
  &&(definition.maxLength===undefined||Number.isInteger(definition.maxLength)&&definition.maxLength>=1&&definition.maxLength<=gridFilterLimits.text)
  &&(definition.numberMode===undefined||definition.type==='number'&&(definition.numberMode==='decimal'||definition.numberMode==='integer'))
  &&(definition.minimum===undefined||definition.type==='number'&&Number.isFinite(definition.minimum))
  &&(definition.maximum===undefined||definition.type==='number'&&Number.isFinite(definition.maximum))
  &&(definition.minimum===undefined||definition.maximum===undefined||definition.minimum<=definition.maximum);
}
export function filterValueValid(value:unknown,definition:GridColumnFilter):value is GridFilterValue{
 if(definition.type==='number')return typeof value==='number'&&Number.isFinite(value)&&(definition.numberMode!=='integer'||Number.isInteger(value))&&(definition.minimum===undefined||value>=definition.minimum)&&(definition.maximum===undefined||value<=definition.maximum);
 if(definition.type==='boolean')return typeof value==='boolean';
 if(typeof value!=='string')return false;
 if(definition.type==='text')return value.length<=(definition.maxLength??200)&&value.trim().length>0;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value.startsWith('0000-'))return false;
 const date=new Date(value+'T12:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
const object=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
/** Reject the entire value rather than silently dropping an unsupported rule. */
export function parseGridFilters(value:unknown,definitions:readonly GridColumnFilter[]):GridFilters{
 if(!Array.isArray(value)||value.length>gridFilterLimits.fields||definitions.length>gridFilterLimits.fields||definitions.some(item=>!filterDefinitionValid(item))||new Set(definitions.map(item=>item.field)).size!==definitions.length)throw Error('Invalid grid filter contract');
 const seen=new Set<string>();
 return Object.freeze(value.map((group:unknown)=>{
  if(!object(group)||Object.keys(group).some(key=>!['field','operator','constraints'].includes(key))||typeof group['field']!=='string'||seen.has(group['field'])||(group['operator']!=='and'&&group['operator']!=='or')||!Array.isArray(group['constraints']))throw Error('Invalid grid filter group');
  const definition=definitions.find(item=>item.field===group['field']);if(!definition||group['constraints'].length<1||group['constraints'].length>(definition.maxConstraints??2))throw Error('Unsupported grid filter field or rule count');
  seen.add(group['field']);const allowed=definition.modes??gridFilterModes[definition.type];
  const constraints=group['constraints'].map((constraint:unknown)=>{
   if(!object(constraint)||Object.keys(constraint).some(key=>!['matchMode','value'].includes(key))||typeof constraint['matchMode']!=='string'||!allowed.some(mode=>mode===constraint['matchMode'])||!filterValueValid(constraint['value'],definition))throw Error('Invalid grid filter constraint');
   return Object.freeze({matchMode:constraint['matchMode'] as GridFilterMode,value:constraint['value']});
  });
  return Object.freeze({field:group['field'],operator:group['operator'],constraints:Object.freeze(constraints)});
 }).sort((a,b)=>definitions.findIndex(item=>item.field===a.field)-definitions.findIndex(item=>item.field===b.field)));
}

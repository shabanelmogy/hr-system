export interface GridDisplayOptions {
 readonly gridLines?:boolean;readonly stripedRows?:boolean;readonly resizableColumns?:'fit'|'expand';readonly reorderableColumns?:boolean;
 readonly frozenColumns?:Readonly<Record<string,'start'|'end'>>;
 readonly columnManagement?:boolean;
}
export interface GridSortItem {readonly field:string;readonly direction:'asc'|'desc';}
export type GridSelectionMode='multiple'|'single'|'radio'|'range';
export interface GridRowGroup {readonly field:string;readonly mode:'subheader'|'rowspan';readonly scope:'page'|'all';readonly expandable?:boolean;}
export interface GridRowAction {readonly id:string;readonly label:string;readonly icon?:import('../icons/app-icon').AppIconName;readonly tone?:'primary'|'secondary'|'success'|'warning'|'danger';readonly disabled?:boolean;}
export function parseGridSort(value:unknown,fields:readonly string[],max=8):readonly GridSortItem[]{
 if(!Array.isArray(value)||value.length>max)throw Error('Invalid grid sort');
 const seen=new Set<string>();
 return Object.freeze(value.map((item:unknown)=>{
  if(typeof item!=='object'||item===null||!('field'in item)||!('direction'in item)||typeof item.field!=='string'||!fields.includes(item.field)||seen.has(item.field)||(item.direction!=='asc'&&item.direction!=='desc')||Object.keys(item).some(key=>!['field','direction'].includes(key)))throw Error('Unsupported grid sort');
  seen.add(item.field);return Object.freeze({field:item.field,direction:item.direction});
 }));
}

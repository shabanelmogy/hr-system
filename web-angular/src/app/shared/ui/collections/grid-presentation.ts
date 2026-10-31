import type { CollectionColumn,CollectionDensity } from './collection.types';
import { gridColumnMinimum } from './grid-column-widths';
export interface GridPresentation {
 readonly version:1;readonly scope:string;readonly order:readonly string[];readonly visible:readonly string[];
 readonly widths:Readonly<Record<string,number>>;readonly density:CollectionDensity;
 readonly pinned:Readonly<Record<string,'start'|'end'>>;
}
/** Presentation only. Never restore records, grants, private criteria or another actor's state. */
export function parseGridPresentation<T>(value:unknown,scope:string,columns:readonly CollectionColumn<T>[]):GridPresentation{
 if(typeof value!=='object'||value===null||Array.isArray(value)||!('version'in value)||value.version!==1||!('scope'in value)||value.scope!==scope||!('order'in value)||!('visible'in value)||!('widths'in value)||!('density'in value)||Object.keys(value).some(key=>!['version','scope','order','visible','widths','density','pinned'].includes(key)))throw Error('Invalid grid presentation');
 const ids=columns.map(column=>column.key),validIds=(input:unknown):input is string[]=>Array.isArray(input)&&new Set(input).size===input.length&&input.every(key=>typeof key==='string'&&ids.includes(key));
 if(!validIds(value.order)||value.order.length!==ids.length||!validIds(value.visible)||value.visible.length<1||!['compact','standard','comfortable'].includes(String(value.density)))throw Error('Unsupported grid presentation');
 const visible=value.visible;if(columns.some(column=>column.hideable===false&&!visible.includes(column.key)))throw Error('Required grid column hidden');
 if(typeof value.widths!=='object'||value.widths===null||Array.isArray(value.widths))throw Error('Invalid grid widths');
 const widths:Record<string,number>={};for(const [key,width]of Object.entries(value.widths)){
  const column=columns.find(item=>item.key===key);if(!column||typeof width!=='number'||!Number.isInteger(width)||width<gridColumnMinimum(column)||width>4096)throw Error('Unsupported grid width');widths[key]=width;
 }
 const rawPins='pinned'in value?value.pinned:{};if(typeof rawPins!=='object'||rawPins===null||Array.isArray(rawPins))throw Error('Invalid pinned columns');
 const pinned:Record<string,'start'|'end'>={};for(const [key,side]of Object.entries(rawPins)){if(!ids.includes(key)||(side!=='start'&&side!=='end'))throw Error('Unsupported pinned column');pinned[key]=side;}
 return Object.freeze({version:1,scope,order:Object.freeze([...value.order]),visible:Object.freeze([...value.visible]),widths:Object.freeze(widths),pinned:Object.freeze(pinned),density:value.density as CollectionDensity});
}

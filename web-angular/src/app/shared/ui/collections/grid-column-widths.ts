import type { CollectionColumn } from './collection.types';
export function gridColumnMinimum<T>(column:CollectionColumn<T>,measuredHeader=0):number{return Math.max(column.minWidth??72,column.header.length*8+32+(column.filter?32:0),Number.isFinite(measuredHeader)?measuredHeader:0);}
/** Match the reference flex-column minimums; remaining width is shared only by eligible flex columns. */
export function gridColumnWidths<T>(columns:readonly CollectionColumn<T>[],available:number,overrides:Readonly<Record<string,number>>={},headerMinimums:Readonly<Record<string,number>>={}):Readonly<Record<string,number>>{
 const result:Record<string,number>={};let remaining=Number.isFinite(available)?Math.max(0,available):0;
 let flexible:CollectionColumn<T>[]=[];
 for(const column of columns){
  if(column.flex&&column.flex>0&&Number.isFinite(column.flex)&&overrides[column.key]===undefined&&column.width===undefined)flexible.push(column);
  else{const width=Math.max(overrides[column.key]??column.width??160,gridColumnMinimum(column,headerMinimums[column.key]));result[column.key]=width;remaining-=width;}
 }
 while(flexible.length){
  const weight=flexible.reduce((sum,column)=>sum+(column.flex??1),0),clamped=flexible.filter(column=>remaining*(column.flex??1)/weight<gridColumnMinimum(column,headerMinimums[column.key]));
  if(!clamped.length){for(const column of flexible)result[column.key]=Math.max(gridColumnMinimum(column,headerMinimums[column.key]),remaining*(column.flex??1)/weight);break;}
  for(const column of clamped){result[column.key]=gridColumnMinimum(column,headerMinimums[column.key]);remaining-=result[column.key];}
  flexible=flexible.filter(column=>!clamped.includes(column));
 }
 return Object.freeze(result);
}

import type { CollectionColumn } from './collection.types';

export interface GridColumnGroup {
 readonly id:string;
 readonly label:string;
 readonly children:readonly GridHeaderDefinition[];
}
export type GridHeaderDefinition=string|GridColumnGroup;
export type GridHeaderCell<T>=
 | {readonly kind:'column';readonly key:string;readonly column:CollectionColumn<T>;readonly colSpan:1;readonly rowSpan:number}
 | {readonly kind:'group';readonly key:string;readonly label:string;readonly columns:readonly CollectionColumn<T>[];readonly colSpan:number;readonly rowSpan:1};
interface Node<T>{readonly key:string;readonly label?:string;readonly column?:CollectionColumn<T>;readonly children:readonly Node<T>[];readonly leaves:readonly CollectionColumn<T>[];readonly position:number;}

/** Resolve only a presentation hierarchy. Hidden leaves are pruned; owner order is retained. */
export function resolveGridHeaders<T>(definitions:unknown,columns:readonly CollectionColumn<T>[],visible:readonly CollectionColumn<T>[]):readonly (readonly GridHeaderCell<T>[])[]{
 if(!Array.isArray(definitions))throw Error('Invalid grid header groups');
 if(!definitions.length)return Object.freeze([Object.freeze(visible.map(column=>Object.freeze({kind:'column' as const,key:'column:'+column.key,column,colSpan:1 as const,rowSpan:1})))]);
 const seenLeaves=new Set<string>(),seenGroups=new Set<string>(),positions=new Map(visible.map((column,index)=>[column.key,index]));let count=0;
 const parse=(value:unknown,depth:number):Node<T>|null=>{
  if(++count>128||depth>4)throw Error('Grid header hierarchy exceeds its bound');
  if(typeof value==='string'){
   const column=columns.find(column=>column.key===value);if(!column||seenLeaves.has(value))throw Error('Unknown or repeated header column');seenLeaves.add(value);
   const position=positions.get(value);return position===undefined?null:{key:'column:'+value,column,children:[],leaves:[column],position};
  }
  if(typeof value!=='object'||value===null||!('id'in value)||!('label'in value)||!('children'in value)||typeof value.id!=='string'||!/^[a-zA-Z][\w.-]{0,79}$/.test(value.id)||seenGroups.has(value.id)||typeof value.label!=='string'||!value.label.trim()||value.label.length>200||!Array.isArray(value.children)||!value.children.length||Object.keys(value).some(key=>!['id','label','children'].includes(key)))throw Error('Invalid header group');
  seenGroups.add(value.id);
  const children=value.children.map((child:unknown)=>parse(child,depth+1)).filter((child):child is Node<T>=>child!==null).sort((a,b)=>a.position-b.position);
  if(!children.length)return null;
  const leaves=children.flatMap(child=>child.leaves),indices=leaves.map(column=>positions.get(column.key)!).sort((a,b)=>a-b);
  if(indices.some((position,index)=>position!==indices[0]+index))throw Error('A header group must cover contiguous visible columns');
  return {key:'group:'+value.id,label:value.label,children,leaves,position:indices[0]};
 };
 const roots=definitions.map(value=>parse(value,0)).filter((node):node is Node<T>=>node!==null).sort((a,b)=>a.position-b.position);
 if(seenLeaves.size!==columns.length||visible.some(column=>!columns.some(item=>item.key===column.key)))throw Error('Header hierarchy must cover every owner column exactly once');
 const depth=(node:Node<T>):number=>node.column?1:1+Math.max(...node.children.map(depth));
 const height=roots.length?Math.max(...roots.map(depth)):1,rows:GridHeaderCell<T>[][]=Array.from({length:height},()=>[]);
 const append=(node:Node<T>,level:number)=>{
  if(node.column)rows[level].push(Object.freeze({kind:'column',key:node.key,column:node.column,colSpan:1,rowSpan:height-level}));
  else{rows[level].push(Object.freeze({kind:'group',key:node.key,label:node.label!,columns:Object.freeze([...node.leaves]),colSpan:node.leaves.length,rowSpan:1}));node.children.forEach(child=>append(child,level+1));}
 };
 roots.forEach(root=>append(root,0));return Object.freeze(rows.map(row=>Object.freeze(row)));
}

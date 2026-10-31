export interface CriteriaSort { readonly field:string; readonly direction:'asc'|'desc'; }
export interface CriteriaSearch { readonly field:string; readonly operator:string; readonly value:string; }
export type CriteriaScalar=string|number|boolean|null;
export interface CriteriaFilter { readonly field:string; readonly operator:string; readonly value:CriteriaScalar; }
export interface CollectionCriteria {
 readonly pageIndex:number;readonly pageSize:number;readonly sort:CriteriaSort|null;
 readonly search:CriteriaSearch|null;readonly filters:readonly CriteriaFilter[];
}
export interface CriteriaFilterPolicy {
 readonly field:string;readonly url:'approved-public';readonly operators:readonly string[];
 readonly kind:'string'|'boolean'|'integer';readonly nullable:boolean;
 readonly maxLength?:number;readonly min?:number;readonly max?:number;
}
export interface CollectionCriteriaPolicy {
 readonly pageSizes:readonly number[];readonly defaultPageSize:number;readonly sortFields:readonly string[];readonly defaultSort:CriteriaSort|null;
 readonly search?:{readonly url:'approved-public';readonly fields:readonly string[];readonly operators:readonly string[];readonly maxLength:number};
 readonly filters:readonly CriteriaFilterPolicy[];
}
export interface CriteriaResolution {readonly value:CollectionCriteria;readonly valid:boolean;readonly reason:'malformed'|'schema'|'oversized'|null;}
export interface CollectionCriteriaCodec {
 readonly defaults:CollectionCriteria;
 normalize(input:unknown):CollectionCriteria|null;
 decode(raw:string|null):CriteriaResolution;
 encode(input:unknown):string|null;
 criteriaKey(value:CollectionCriteria):string;
 change(current:CollectionCriteria,patch:Partial<CollectionCriteria>):CollectionCriteria|null;
}
const record=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);
const keys=(value:Record<string,unknown>,expected:readonly string[])=>Object.keys(value).length===expected.length&&expected.every(key=>Object.hasOwn(value,key));
const name=(value:unknown):value is string=>typeof value==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(value)&&!['constructor','prototype'].includes(value);
const names=(values:readonly string[])=>Array.isArray(values)&&values.length>0&&values.length<=16&&new Set(values).size===values.length&&values.every(name);
const boundedLength=(value:number)=>Number.isInteger(value)&&value>=1&&value<=128;
const text=(value:unknown,max:number):value is string=>typeof value==='string'&&value.length<=max&&!/[\u0000-\u001f\u007f]|\p{Surrogate}/u.test(value);
const sortKey=(value:CriteriaFilter)=>value.field+'\0'+value.operator;
function freeze(value:CollectionCriteria):CollectionCriteria{
 if(value.sort)Object.freeze(value.sort);if(value.search)Object.freeze(value.search);
 value.filters.forEach(Object.freeze);Object.freeze(value.filters);return Object.freeze(value);
}
/** Optional opt-in URL policy, never inferred from a DTO, auth context or API wire format. */
export function createCollectionCriteriaCodec(input:CollectionCriteriaPolicy):CollectionCriteriaCodec{
 const bad=()=>{throw new Error('Invalid collection criteria URL policy');};
 if(!Array.isArray(input.pageSizes)||input.pageSizes.length<1||input.pageSizes.length>8||new Set(input.pageSizes).size!==input.pageSizes.length||!input.pageSizes.every(size=>Number.isInteger(size)&&size>=1&&size<=1000)||!input.pageSizes.includes(input.defaultPageSize))bad();
 if(!Array.isArray(input.sortFields)||input.sortFields.length>16||new Set(input.sortFields).size!==input.sortFields.length||!input.sortFields.every(name))bad();
 if(input.defaultSort&&(!input.sortFields.includes(input.defaultSort.field)||!['asc','desc'].includes(input.defaultSort.direction)))bad();
 if(input.search&&(input.search.url!=='approved-public'||!names(input.search.fields)||!names(input.search.operators)||!boundedLength(input.search.maxLength)))bad();
 if(!Array.isArray(input.filters)||input.filters.length>16||new Set(input.filters.map(f=>f.field)).size!==input.filters.length)bad();
 for(const field of input.filters){
  if(!name(field.field)||field.url!=='approved-public'||!names(field.operators)||!['string','boolean','integer'].includes(field.kind)||typeof field.nullable!=='boolean')bad();
  if(field.maxLength!==undefined&&(field.kind!=='string'||!boundedLength(field.maxLength)))bad();
  if((field.min!==undefined||field.max!==undefined)&&(field.kind!=='integer'||(field.min!==undefined&&!Number.isSafeInteger(field.min))||(field.max!==undefined&&!Number.isSafeInteger(field.max))||(field.min!==undefined&&field.max!==undefined&&field.min>field.max)))bad();
 }
 // Copy the policy so a later caller mutation cannot weaken an active codec.
 const pageSizes=[...input.pageSizes],sortFields=[...input.sortFields],searchPolicy=input.search?{...input.search,fields:[...input.search.fields],operators:[...input.search.operators]}:null;
 const filterPolicies=new Map(input.filters.map(f=>[f.field,{...f,operators:[...f.operators]}]));
 const defaults=freeze({pageIndex:0,pageSize:input.defaultPageSize,sort:input.defaultSort?{...input.defaultSort}:null,search:null,filters:[]});
 function normalize(value:unknown):CollectionCriteria|null{
  if(!record(value)||!keys(value,['pageIndex','pageSize','sort','search','filters']))return null;
  if(typeof value['pageIndex']!=='number'||!Number.isInteger(value['pageIndex'])||value['pageIndex']<0||value['pageIndex']>100000||typeof value['pageSize']!=='number'||!pageSizes.includes(value['pageSize']))return null;
  let sort:CriteriaSort|null=null,search:CriteriaSearch|null=null;
  const rawSort=value['sort'];if(rawSort!==null){if(!record(rawSort)||!keys(rawSort,['field','direction'])||typeof rawSort['field']!=='string'||!sortFields.includes(rawSort['field'])||(rawSort['direction']!=='asc'&&rawSort['direction']!=='desc'))return null;sort={field:rawSort['field'],direction:rawSort['direction']};}
  const rawSearch=value['search'];if(rawSearch!==null){if(!searchPolicy||!record(rawSearch)||!keys(rawSearch,['field','operator','value'])||typeof rawSearch['field']!=='string'||!searchPolicy.fields.includes(rawSearch['field'])||typeof rawSearch['operator']!=='string'||!searchPolicy.operators.includes(rawSearch['operator'])||!text(rawSearch['value'],searchPolicy.maxLength))return null;search={field:rawSearch['field'],operator:rawSearch['operator'],value:rawSearch['value']};}
  const rawFilters=value['filters'];if(!Array.isArray(rawFilters)||rawFilters.length>8)return null;
  const filters:CriteriaFilter[]=[],seen=new Set<string>();
  for(const raw of rawFilters as readonly unknown[]){
   if(!record(raw)||!keys(raw,['field','operator','value'])||typeof raw['field']!=='string'||typeof raw['operator']!=='string')return null;
   const policy=filterPolicies.get(raw['field']);if(!policy||!policy.operators.includes(raw['operator']))return null;
   const item=raw['value'];if(item===null){if(!policy.nullable)return null;}
   else if(policy.kind==='string'){if(!text(item,policy.maxLength??128))return null;}
   else if(policy.kind==='boolean'){if(typeof item!=='boolean')return null;}
   else if(typeof item!=='number'||!Number.isSafeInteger(item)||item<(policy.min??Number.MIN_SAFE_INTEGER)||item>(policy.max??Number.MAX_SAFE_INTEGER))return null;
   const filter:CriteriaFilter={field:raw['field'],operator:raw['operator'],value:item as CriteriaScalar},key=sortKey(filter);if(seen.has(key))return null;seen.add(key);filters.push(filter);
  }
  filters.sort((a,b)=>sortKey(a)<sortKey(b)?-1:sortKey(a)>sortKey(b)?1:0);
  const result={pageIndex:value['pageIndex'],pageSize:value['pageSize'],sort,search,filters};
  const serialized=JSON.stringify({v:1,...result});
  if(serialized.length>2048||encodeURIComponent(serialized).length>8192)return null;
  return freeze(result);
 }
 const criteriaKey=(value:CollectionCriteria)=>JSON.stringify([value.sort,value.search,value.filters]);
 function encode(value:unknown):string|null{
  const normalized=normalize(value);if(!normalized)return null;const result=JSON.stringify({v:1,...normalized});
  return result.length<=2048&&encodeURIComponent(result).length<=8192?result:null;
 }
 function decode(raw:string|null):CriteriaResolution{
  const fail=(reason:CriteriaResolution['reason']):CriteriaResolution=>({value:defaults,valid:false,reason});
  if(raw===null)return{value:defaults,valid:true,reason:null};
  if(raw.length>2048)return fail('oversized');
  try{
   if(encodeURIComponent(raw).length>8192)return fail('oversized');
   const parsed:unknown=JSON.parse(raw);if(!record(parsed)||!keys(parsed,['v','pageIndex','pageSize','sort','search','filters'])||parsed['v']!==1)return fail('schema');
   const{v:version,...value}=parsed;const result=normalize(value);return result?{value:result,valid:true,reason:null}:fail('schema');
  }catch{return fail('malformed');}
 }
 function change(current:CollectionCriteria,patch:Partial<CollectionCriteria>):CollectionCriteria|null{
  const next=normalize({...current,...patch});if(!next)return null;
  const changed=next.pageSize!==current.pageSize||criteriaKey(next)!==criteriaKey(current);
  const candidate=changed?freeze({...next,pageIndex:0}):next;return encode(candidate)===null?null:candidate;
 }
 return Object.freeze({defaults,normalize,decode,encode,criteriaKey,change});
}

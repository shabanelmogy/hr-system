import { collectionIdKey,collectionQueryKey,type CollectionId,type CollectionQuery,type CollectionSource,type CollectionView,type RecordAction } from './collection.types';
export const sameCollectionScope=(a:CollectionQuery,b:CollectionQuery)=>a.scopeKey===b.scopeKey&&a.criteriaKey===b.criteriaKey;
export function inspectCollection<T>(source:CollectionSource<T>,rowId:(row:T)=>CollectionId):CollectionView<T>{
 const {query,result}=source;
 const empty={query,kind:source.kind,rows:[] as readonly T[],total:null,hasNextPage:false};
 if(!query.scopeKey.trim()||source.kind==='forbidden')return {...empty,kind:'forbidden'};
 if(!Number.isInteger(query.pageIndex)||query.pageIndex<0||!Number.isInteger(query.pageSize)||query.pageSize<1)return {...empty,kind:'error'};
 if(!result||!sameCollectionScope(query,result.query))return {...empty,kind:source.kind==='ready'?'loading':source.kind};
 const total=result.total;
 if(total!==null&&(!Number.isSafeInteger(total)||total<0))return {...empty,kind:'error'};
 const base={...empty,total};
 if(source.kind!=='ready')return base;
 if(collectionQueryKey(query)!==collectionQueryKey(result.query))return {...base,kind:'loading'};
 const ids=result.rows.map(rowId);
 const invalidId=ids.some(id=>typeof id==='number'?!Number.isFinite(id):typeof id!=='string'||!id.trim());
 if(invalidId||new Set(ids.map(collectionIdKey)).size!==ids.length||result.rows.length>query.pageSize||(total!==null&&(result.rows.length>total||result.rows.length>0&&query.pageIndex*query.pageSize+result.rows.length>total)))return {...base,kind:'error'};
 return {...base,kind:'ready',rows:result.rows,hasNextPage:total===null?result.hasNextPage:(query.pageIndex+1)*query.pageSize<total};
}
export function recordTarget<T>(view:CollectionView<T>,rowId:(row:T)=>CollectionId,active:CollectionId|null,action:RecordAction):number|null{
 if(view.kind!=='ready'||view.rows.length===0)return null;
 const {pageIndex,pageSize}=view.query,start=pageIndex*pageSize;
 const local=active===null?-1:view.rows.findIndex(row=>rowId(row)===active);
 const current=start+Math.max(0,local),bound=view.total??(view.hasNextPage?start+pageSize+1:start+view.rows.length);
 if(action==='last'&&view.total===null)return null;
 const target=action==='last'?bound-1:action==='first'?0:action==='previous'?current-1:local<0?start:local===view.rows.length-1&&view.hasNextPage?start+pageSize:current+1;
 return target<0||target>=bound||Math.floor(target/pageSize)===pageIndex&&target-start>=view.rows.length?null:target;
}

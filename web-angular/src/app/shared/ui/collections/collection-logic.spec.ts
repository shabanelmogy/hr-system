import { inspectCollection,recordTarget } from './collection-logic';
import type { CollectionSource } from './collection.types';
const query={scopeKey:'scope-one',criteriaKey:'all',pageIndex:0,pageSize:5};
const rows=[{id:1},{id:2},{id:3},{id:4},{id:5}];
const source:CollectionSource<{id:number}>={query,kind:'ready',result:{query,rows,total:12,hasNextPage:true}};
const id=(row:{id:number})=>row.id;
describe('Shared collection controlled source',()=>{
 it('handles partial unknown pages without targeting a missing same-page row',()=>{
  const partial=inspectCollection({...source,result:{query,rows:[{id:1},{id:2}],total:null,hasNextPage:true}},id);
  expect(recordTarget(partial,id,2,'next')).toBe(5);
  expect(recordTarget({...partial,hasNextPage:false},id,2,'next')).toBeNull();
  expect(recordTarget({...partial,total:3,hasNextPage:false},id,2,'last')).toBeNull();
 });
 it('masks stale scope/criteria/page and retains only safe same-query counts during loading',()=>{
  expect(inspectCollection(source,id).rows).toEqual(rows);
  for(const change of [{scopeKey:'other'},{criteriaKey:'filtered'},{pageIndex:1},{pageSize:10}]){
   const view=inspectCollection({...source,query:{...query,...change}},id);expect(view.rows).toEqual([]);expect(view.kind).toBe('loading');
   expect(view.total).toBe('scopeKey'in change||'criteriaKey'in change?null:12);
  }
  expect(inspectCollection({...source,kind:'loading'},id).total).toBe(12);
  expect(inspectCollection({...source,kind:'forbidden'},id).total).toBeNull();
 });
 it('rejects duplicate identities, invalid totals/page/size and keeps valid zero distinct from unknown',()=>{
  expect(inspectCollection({...source,result:{...source.result!,rows:[{id:1},{id:1}]}},id).kind).toBe('error');
  expect(inspectCollection({...source,result:{...source.result!,total:-1}},id).kind).toBe('error');
  expect(inspectCollection({...source,query:{...query,pageSize:0}},id).kind).toBe('error');
  expect(inspectCollection({...source,result:{query,rows:[],total:0,hasNextPage:false}},id).total).toBe(0);
  expect(inspectCollection({...source,result:{...source.result!,total:null}},id).total).toBeNull();
 });
 it('keeps the caller out-of-range page and does not manufacture a clamp command',()=>{
  const emptyQuery={...query,pageIndex:4};const view=inspectCollection({query:emptyQuery,kind:'ready',result:{query:emptyQuery,rows:[],total:2,hasNextPage:false}},id);
  expect(view.query.pageIndex).toBe(4);expect(view.rows).toEqual([]);expect(view.kind).toBe('ready');
 });
 it('handles record page crossing and unknown-last/next boundaries without skipping an unacquired record',()=>{
  const view=inspectCollection(source,id);expect(recordTarget(view,id,5,'next')).toBe(5);expect(recordTarget(view,id,1,'last')).toBe(11);expect(recordTarget(view,id,null,'next')).toBe(0);
  const unknown=inspectCollection({...source,result:{...source.result!,total:null}},id);expect(recordTarget(unknown,id,1,'last')).toBeNull();expect(recordTarget(unknown,id,5,'next')).toBe(5);
  expect(recordTarget({...unknown,hasNextPage:false},id,5,'next')).toBeNull();
 });
});

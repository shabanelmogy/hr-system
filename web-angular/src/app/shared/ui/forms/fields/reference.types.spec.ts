import { inspectReference,resolvedReference,validReferenceId,type ReferenceSource } from './reference.types';
const query={scopeKey:'scope-one:parent-one',search:''};
const source:ReferenceSource={query,kind:'ready',result:{query,options:[{value:0,label:'Zero'},{value:'0',label:'String zero'}],hasMore:true}};
describe('Reference input boundaries',()=>{
 it('preserves numeric zero versus string zero and rejects unsafe/duplicate identities',()=>{
  expect(inspectReference(source,'').options).toHaveLength(2);expect(validReferenceId(0)).toBe(true);expect(validReferenceId('0')).toBe(true);
  for(const value of ['',NaN,Infinity,{},Number.MAX_SAFE_INTEGER+1])expect(validReferenceId(value)).toBe(false);
  expect(inspectReference({...source,result:{...source.result!,options:[{value:1,label:'One'},{value:1,label:'Duplicate'}]}},'').kind).toBe('error');
 });
 it('masks stale source and uncommitted search immediately, including forbidden scopes',()=>{
  expect(inspectReference(source,'changed').options).toEqual([]);
  expect(inspectReference({...source,query:{...query,scopeKey:'new'}},'').kind).toBe('loading');
  expect(inspectReference({...source,kind:'forbidden'},'').options).toEqual([]);
 });
 it('resolves an off-page selected record only for the exact typed ID and scope',()=>{
  const selection={scopeKey:query.scopeKey,value:91,kind:'ready',option:{value:91,label:'Resolved',disabled:true}} as const;
  expect(resolvedReference(selection,query.scopeKey,91)?.label).toBe('Resolved');
  expect(resolvedReference(selection,query.scopeKey,'91')).toBeNull();expect(resolvedReference(selection,'other',91)).toBeNull();
  expect(resolvedReference({...selection,kind:'missing'},query.scopeKey,91)).toBeNull();
 });
});

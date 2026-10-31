import { createCollectionCriteriaCodec,type CollectionCriteriaPolicy } from './collection-criteria';
const policy=():CollectionCriteriaPolicy=>({pageSizes:[5,10,25,50],defaultPageSize:10,sortFields:['id','name'],defaultSort:{field:'id',direction:'asc'},search:{url:'approved-public',fields:['name'],operators:['contains','equals'],maxLength:128},filters:[{field:'active',url:'approved-public',operators:['equals'],kind:'boolean',nullable:true},{field:'id',url:'approved-public',operators:['equals'],kind:'integer',nullable:false,min:0,max:1000},{field:'label',url:'approved-public',operators:['equals'],kind:'string',nullable:true,maxLength:128}]});
describe('Shared opt-in applied collection criteria codec',()=>{
 it.each([false,0,null,'','عربي🙂'])('retains literal scalar %j without truthy conversion',value=>{
  const codec=createCollectionCriteriaCodec(policy()),field=typeof value==='boolean'||value===null?'active':typeof value==='number'?'id':'label';
  const state={...codec.defaults,filters:[{field,operator:'equals',value}]};const encoded=codec.encode(state);expect(encoded).not.toBeNull();const restored=codec.decode(encoded);expect(restored.valid).toBe(true);expect(restored.value.filters[0].value).toBe(value);
 });
 it('distinguishes absent filter, explicit null, empty string and cleared state',()=>{
  const codec=createCollectionCriteriaCodec(policy());const absent=codec.encode(codec.defaults),nil=codec.encode({...codec.defaults,filters:[{field:'active',operator:'equals',value:null}]}),empty=codec.encode({...codec.defaults,filters:[{field:'label',operator:'equals',value:''}]});expect(new Set([absent,nil,empty]).size).toBe(3);expect(codec.change(codec.decode(nil).value,{filters:[]})).toEqual(codec.defaults);
 });
 it('canonicalizes filter ordering while retaining typed false and zero',()=>{
  const codec=createCollectionCriteriaCodec(policy()),a={...codec.defaults,filters:[{field:'id',operator:'equals',value:0},{field:'active',operator:'equals',value:false}]};expect(codec.encode(a)).toBe(codec.encode({...a,filters:[...a.filters].reverse()}));expect(codec.decode(codec.encode(a)).value.filters.map(f=>f.value)).toEqual([false,0]);
 });
 it.each([
  {pageIndex:-1},{pageIndex:100001},{pageIndex:'0'},{pageSize:7},{pageSize:'10'},
  {sort:{field:'salary',direction:'asc'}},{sort:{field:'id',direction:'ASC'}},
  {search:{field:'name',operator:'delete',value:'x'}},{search:{field:'private',operator:'contains',value:'x'}},
  {filters:[{field:'active',operator:'equals',value:'false'}]},{filters:[{field:'active',operator:'equals',value:0}]},
  {filters:[{field:'id',operator:'equals',value:null}]},{filters:[{field:'id',operator:'equals',value:Number.MAX_SAFE_INTEGER+1}]},
  {filters:[{field:'label',operator:'equals',value:{value:'x'}}]},{scopeKey:'tenant'},
 ])('fails closed for unapproved/wrong/bounded criteria %j',patch=>{
  const codec=createCollectionCriteriaCodec(policy()),state={...codec.defaults,...patch};expect(codec.normalize(state)).toBeNull();expect(codec.encode(state)).toBeNull();const restored=codec.decode(JSON.stringify({v:1,...state}));expect(restored.valid).toBe(false);expect(restored.value).toEqual(codec.defaults);
 });
 it('rejects duplicate filters and unexpected nested properties without partial application',()=>{
  const codec=createCollectionCriteriaCodec(policy()),item={field:'active',operator:'equals',value:false};expect(codec.normalize({...codec.defaults,filters:[item,item]})).toBeNull();expect(codec.normalize({...codec.defaults,filters:[{...item,secret:'x'}]})).toBeNull();expect(codec.decode('{"v":1,"__proto__":{"admin":true}}').valid).toBe(false);expect(Object.hasOwn({},'admin')).toBe(false);
 });
 it.each(['','{','null','[]','{"v":2}', 'x'.repeat(2049)])('handles malformed or oversized URL input safely',raw=>{const codec=createCollectionCriteriaCodec(policy());const result=codec.decode(raw);expect(result.valid).toBe(false);expect(result.value).toEqual(codec.defaults);expect(codec.decode(null).valid).toBe(true);});
 it('checks total encoded capacity, Unicode/control characters and filter count',()=>{
  const codec=createCollectionCriteriaCodec(policy());for(const value of['\n','\0','\uD800','a'.repeat(129)])expect(codec.normalize({...codec.defaults,search:{field:'name',operator:'contains',value}})).toBeNull();expect(codec.normalize({...codec.defaults,filters:Array.from({length:9},()=>({field:'id',operator:'equals',value:0}))})).toBeNull();
  const many=Array.from({length:8},(_,i)=>({field:'field'+i,url:'approved-public' as const,operators:['equals'],kind:'string' as const,nullable:false,maxLength:128}));const large=createCollectionCriteriaCodec({...policy(),filters:many});const value={...large.defaults,filters:many.map(f=>({field:f.field,operator:'equals',value:'界'.repeat(128)})),search:{field:'name',operator:'contains',value:'界'.repeat(128)}};expect(encodeURIComponent(JSON.stringify({v:1,...value})).length).toBeGreaterThan(8192);expect(large.normalize(value)).toBeNull();expect(large.encode(value)).toBeNull();
 });
 it('resets page on real criteria/size changes and preserves page-only and no-op criteria',()=>{
  const codec=createCollectionCriteriaCodec(policy()),page={...codec.defaults,pageIndex:3};expect(codec.change(page,{pageIndex:4})?.pageIndex).toBe(4);expect(codec.change(page,{pageSize:25})?.pageIndex).toBe(0);expect(codec.change(page,{sort:{field:'name',direction:'desc'}})?.pageIndex).toBe(0);expect(codec.change(page,{search:{field:'name',operator:'contains',value:'x'}})?.pageIndex).toBe(0);expect(codec.change(page,{filters:[{field:'active',operator:'equals',value:false}]})?.pageIndex).toBe(0);expect(codec.change(page,{filters:[]})).toEqual(page);expect(codec.criteriaKey(page)).toBe(codec.criteriaKey(codec.defaults));
 });
 it('does not opt search into URL when absent from policy',()=>{const config=policy(),codec=createCollectionCriteriaCodec({...config,search:undefined});expect(codec.normalize({...codec.defaults,search:{field:'name',operator:'contains',value:'x'}})).toBeNull();});
 it('copies policy and returned values so mutable caller objects cannot weaken live constraints',()=>{
  const sizes=[10,25],fields=['id'],config={pageSizes:sizes,defaultPageSize:10,sortFields:fields,defaultSort:{field:'id',direction:'asc' as const},filters:[]};const codec=createCollectionCriteriaCodec(config);sizes.push(999);fields.push('secret');expect(codec.normalize({...codec.defaults,pageSize:999})).toBeNull();expect(codec.normalize({...codec.defaults,sort:{field:'secret',direction:'asc'}})).toBeNull();const state=codec.normalize({...codec.defaults})!;expect(Object.isFrozen(state)).toBe(true);expect(Object.isFrozen(state.sort)).toBe(true);expect(Object.isFrozen(state.filters)).toBe(true);
 });
 it.each([{pageSizes:[]},{defaultPageSize:7},{sortFields:['constructor']},{search:{url:'private',fields:['name'],operators:['contains'],maxLength:20}},{filters:[{field:'active',url:'private',operators:['equals'],kind:'boolean',nullable:false}]}])('rejects invalid/private policy configuration %j',patch=>{expect(()=>createCollectionCriteriaCodec({...policy(),...patch} as CollectionCriteriaPolicy)).toThrow();});
});

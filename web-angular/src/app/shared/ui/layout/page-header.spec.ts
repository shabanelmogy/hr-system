import { partitionPageViews,type PageViewOption } from './page-header';
describe('Shared collection header mobile view partition',()=>{
 const options:readonly PageViewOption[]=['grid','cards','chart','report','import'].map(id=>({id,label:id,icon:'apps'}));
 it('keeps the active overflow view visible in the last compact slot without changing source order',()=>{
  const result=partitionPageViews(options,'report',2);expect(result.visible.map(item=>item.id)).toEqual(['grid','report']);expect(result.overflow.map(item=>item.id)).toEqual(['cards','chart','import']);expect(options.map(item=>item.id)).toEqual(['grid','cards','chart','report','import']);
 });
 it('retains all small sets and never produces an empty visible slot when the limit is zero',()=>{
  expect(partitionPageViews(options.slice(0,2),'grid',2).overflow).toEqual([]);expect(partitionPageViews(options,'import',0).visible.map(item=>item.id)).toEqual(['import']);
 });
});

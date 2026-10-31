import { collectionKeyTarget } from './collection-keyboard';
describe('Shared record keyboard targets',()=>{
 const page={pageIndex:0,pageSize:5,rowIndex:4,rowCount:5,total:7,hasNextPage:true,rtl:false};
 const key=(value:string,ctrlKey=false)=>({key:value,ctrlKey,altKey:false,metaKey:false});
 it('supports vertical and logical horizontal arrows without reversing vertical meaning in RTL',()=>{
  expect(collectionKeyTarget(key('ArrowDown'),page)).toBe('next');expect(collectionKeyTarget(key('ArrowUp'),page)).toBe('previous');expect(collectionKeyTarget(key('ArrowRight'),page)).toBe('next');expect(collectionKeyTarget(key('ArrowLeft'),{...page,rtl:true})).toBe('next');
 });
 it('distinguishes page Home/End from global Ctrl targets and clamps PageDown to a partial final page',()=>{
  expect(collectionKeyTarget(key('Home'),page)).toBe(0);expect(collectionKeyTarget(key('End'),page)).toBe(4);expect(collectionKeyTarget(key('End',true),page)).toBe('last');expect(collectionKeyTarget(key('Home',true),page)).toBe('first');expect(collectionKeyTarget(key('PageDown'),page)).toBe(6);expect(collectionKeyTarget(key('PageUp'),{...page,pageIndex:1,rowIndex:1,rowCount:2})).toBe(1);
 });
 it('bounds unknown-total navigation and preserves browser modifier shortcuts',()=>{
  expect(collectionKeyTarget(key('PageDown'),{...page,total:null})).toBe(5);expect(collectionKeyTarget({...key('ArrowDown'),altKey:true},page)).toBeNull();expect(collectionKeyTarget(key('ArrowDown',true),page)).toBeNull();expect(collectionKeyTarget(key('ArrowDown'),{...page,rowIndex:-1})).toBeNull();
 });
});

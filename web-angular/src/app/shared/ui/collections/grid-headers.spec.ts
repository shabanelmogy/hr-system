import { Component,signal,viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../theme/public-api';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import { CollectionColumnHeader,CollectionColumnFooter,MyDataGrid,type CollectionColumn,type CollectionSource,type GridHeaderDefinition } from '../public-api';
import { resolveGridHeaders } from './grid-header-groups';
interface Row {readonly id:number;readonly name:string;readonly amount:number;}
const columns:readonly CollectionColumn<Row>[]=[{key:'id',header:'ID',value:row=>row.id,sortField:'id'},{key:'name',header:'Name',value:row=>row.name,sortField:'name',filter:{field:'name',type:'text'}},{key:'amount',header:'Amount',value:row=>row.amount}];
const query={scopeKey:'actor1',criteriaKey:'all',pageIndex:0,pageSize:10},rows:readonly Row[]=[{id:1,name:'A',amount:2},{id:2,name:'B',amount:3}];
const groups:readonly GridHeaderDefinition[]=[{id:'record',label:'Record',children:['id',{id:'names',label:'Names',children:['name']}]},'amount'];
@Component({imports:[MyDataGrid,CollectionColumnHeader,CollectionColumnFooter],template:`
 <erp-data-table #grid label="Fixture" [source]="source()" [columns]="columns" [rowId]="id" [headerGroups]="groups" [advancedFilters]="true" (sortChange)="sorted($event)">
  <ng-template [erpCollectionColumnHeader]="columns[0]" let-column><span data-testid="custom-header">{{column.header}} custom</span></ng-template>
  <ng-template [erpCollectionColumnFooter]="columns[2]" let-page let-total="total" let-currentQuery="query"><output data-testid="custom-footer">{{sum(page)}} / {{total}} / {{currentQuery.scopeKey}}</output></ng-template>
 </erp-data-table>`})
class Fixture{
 readonly columns=columns;readonly groups=groups;readonly id=(row:Row)=>row.id;readonly sorted=vi.fn();
 readonly source=signal<CollectionSource<Row>>({query,kind:'ready',result:{query,rows,total:9,hasNextPage:true}});
 readonly grid=viewChild.required<MyDataGrid<Row>>('grid');readonly sum=(page:readonly Row[])=>page.reduce((total,row)=>total+row.amount,0);
}
describe('Typed shared header hierarchy and projection',()=>{
 it('uses rowspan and colspan for unequal-depth groups while retaining leaf order and pruning hidden columns',()=>{
  const resolved=resolveGridHeaders(groups,columns,columns);expect(resolved).toHaveLength(3);
  expect(resolved[0].map(cell=>[cell.key,cell.colSpan,cell.rowSpan])).toEqual([['group:record',2,1],['column:amount',1,3]]);
  expect(resolved[1].map(cell=>[cell.key,cell.rowSpan])).toEqual([['column:id',2],['group:names',1]]);
  expect(resolved[2][0].key).toBe('column:name');expect(Object.isFrozen(resolved[0])).toBe(true);
  expect(resolveGridHeaders(groups,columns,columns.filter(column=>column.key!=='name'))).toHaveLength(2);
 });
 it('rejects duplicate,missing,unknown,cyclic,oversized and split groups as a whole',()=>{
  const cyclic:{id:string;label:string;children:unknown[]}={id:'cycle',label:'Cycle',children:[]};cyclic.children.push(cyclic);
  for(const definition of [['id','name'],['id','name','missing'],['id','name','name','amount'],[cyclic],[{id:'bad',label:'',children:['id','name','amount']}],Array.from({length:129},()=> 'id')])expect(()=>resolveGridHeaders(definition,columns,columns)).toThrow();
  expect(()=>resolveGridHeaders(groups,columns,[columns[0],columns[2],columns[1]])).toThrow();
 });
 it('keeps valid reordering within groups,default ungrouped columns and input data immutable',()=>{
  const ordered=resolveGridHeaders([{id:'record',label:'Record',children:['id','name']},'amount'],columns,[columns[1],columns[0],columns[2]]);
  expect(ordered[1].map(cell=>cell.key)).toEqual(['column:name','column:id']);expect(columns.map(column=>column.key)).toEqual(['id','name','amount']);
  expect(resolveGridHeaders([],columns,columns)).toHaveLength(1);
 });
 beforeEach(async()=>{vi.stubGlobal('matchMedia',()=>({matches:false,media:'',addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}));vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}});TestBed.configureTestingModule({providers:[provideAppTheme()]});await TestBed.inject(LocalizationRuntime).loadNamespace('core');});
 afterEach(()=>{TestBed.resetTestingModule();vi.unstubAllGlobals();});
 it('composes projected header labels with native sort/filter and page-scoped footers that disappear on forbidden',async()=>{
  const fixture=TestBed.createComponent(Fixture);await fixture.whenStable();const element=fixture.nativeElement as HTMLElement;
  expect(element.querySelectorAll('thead tr')).toHaveLength(3);expect(element.querySelector('[data-testid=custom-header]')?.textContent).toBe('ID custom');
  expect(element.querySelector('th[data-column-key=id]')?.getAttribute('rowspan')).toBe('2');expect(element.querySelector('th[data-column-key=id] p-sorticon')).not.toBeNull();expect(element.querySelector('th[data-column-key=name] p-column-filter')).not.toBeNull();
  expect(element.querySelector('[data-testid=custom-footer]')?.textContent).toBe('5 / 9 / actor1');expect(rows[0].amount).toBe(2);
  fixture.componentInstance.source.set({query,kind:'forbidden'});await fixture.whenStable();expect(element.querySelector('tfoot')).toBeNull();
 });
 it('discards a coalesced sort from a previous owner source before its callback runs',async()=>{
  const fixture=TestBed.createComponent(Fixture);await fixture.whenStable();const owner=fixture.componentInstance;owner.sorted.mockClear();
  owner.grid().changeSort({field:'name',order:-1});const other={...query,scopeKey:'actor2'};owner.source.set({query:other,kind:'ready',result:{query:other,rows,total:2,hasNextPage:false}});fixture.detectChanges();await fixture.whenStable();
  expect(owner.sorted).not.toHaveBeenCalled();
 });
});

import { Component,signal,viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CollectionFrame } from './collection-frame';
import { ContextMenuPanel } from '../overlays/context-menu-panel';
import { CollectionFooter } from './collection-footer';
import { createCollectionController } from './collection-controller';
import { provideAppTheme } from '../../../../theme/public-api';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import { CollectionRowDetails,MyDataGrid,type CollectionColumn,type CollectionSource,type GridFilters,type GridRowGroup,type CollectionId,type GridSelectionMode } from '../public-api';
interface Row {id:number;name:string;}
const query={scopeKey:'actor1',criteriaKey:'all',pageIndex:0,pageSize:10};
const rows=[{id:1,name:'First'},{id:2,name:'Second'}];
@Component({imports:[MyDataGrid,CollectionRowDetails],template:`<erp-data-table #grid [source]="source()" label="Fixture" [columns]="columns" [rowId]="id" [advancedFilters]="true" [filters]="filters()" [grouping]="grouping()" [frozenIds]="frozen()" [selectionMode]="selectionMode()" [display]="{columnManagement:true,reorderableColumns:true}" (filtersChange)="filterChanged($event)">@if(detailsEnabled()){<ng-template [erpCollectionRowDetails]="source()" let-row><div class="details">{{row.name}}</div></ng-template>}</erp-data-table>`})
class Fixture{
 readonly source=signal<CollectionSource<Row>>({query,kind:'ready',result:{query,rows,total:2,hasNextPage:false}});
 readonly columns:readonly CollectionColumn<Row>[]=[{key:'id',header:'ID',value:row=>row.id,hideable:false,sortField:'id'},{key:'name',header:'Name',value:row=>row.name,sortField:'name',filter:{field:'name',type:'text',maxLength:200,maxConstraints:4}}];
 readonly filters=signal<GridFilters>([]);readonly filterChanged=vi.fn((value:GridFilters)=>this.filters.set(value));readonly id=(row:Row)=>row.id;readonly grid=viewChild.required<MyDataGrid<Row>>('grid');
 readonly detailsEnabled=signal(true);readonly grouping=signal<GridRowGroup|null>(null);readonly frozen=signal<readonly CollectionId[]>([]);readonly selectionMode=signal<GridSelectionMode>('multiple');
}
describe('Real shared Table capability composition',()=>{
 beforeEach(async()=>{vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}});vi.stubGlobal('matchMedia',()=>({matches:false,media:'',addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}));TestBed.configureTestingModule({providers:[provideAppTheme()]});await TestBed.inject(LocalizationRuntime).loadNamespace('core');});
 afterEach(()=>{TestBed.resetTestingModule();vi.unstubAllGlobals();});
 it('filters a captured cell through the controlled public API and refuses stale snapshots or dismissed commands',async()=>{
  const show=vi.spyOn(ContextMenuPanel.prototype,'show').mockImplementation(()=>{});
  try{
   const fixture=TestBed.createComponent(MyDataGrid<Row>),callback=vi.fn(),source:CollectionSource<Row>={query,kind:'ready',result:{query,rows,total:2,hasNextPage:false}};
   fixture.componentRef.setInput('source',source);fixture.componentRef.setInput('label','Cell fixture');fixture.componentRef.setInput('columns',[{key:'name',header:'Name',value:(row:Row)=>row.name,filter:{field:'name',type:'text'}}]);fixture.componentRef.setInput('rowId',(row:Row)=>row.id);fixture.componentRef.setInput('advancedFilters',true);fixture.componentInstance.filtersChange.subscribe(callback);await fixture.whenStable();
   const grid=fixture.componentInstance,root=fixture.nativeElement as HTMLElement;
   const open=()=>root.querySelector('td[data-cell-column="name"]')!.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:10,clientY:10}));
   open();expect(grid.contextItems().some(item=>item.id==='filter-by-value')).toBe(true);
   fixture.componentRef.setInput('source',{...source});grid.runContextCommand('filter-by-value');expect(callback).not.toHaveBeenCalled();await fixture.whenStable();
   open();grid.dismissContext();grid.runContextCommand('filter-by-value');expect(callback).not.toHaveBeenCalled();
   open();grid.runContextCommand('filter-by-value');expect(callback).toHaveBeenCalledExactlyOnceWith([{field:'name',operator:'and',constraints:[{matchMode:'equals',value:'First'}]}]);
  }finally{show.mockRestore();}
 });
 it('uses native record indices without confusing them with the server page size',()=>{
  const source=signal<CollectionSource<Row>>({query,kind:'ready',result:{query,rows,total:12,hasNextPage:true}}),page=vi.fn();
  const model=TestBed.runInInjectionContext(()=>createCollectionController(source,signal((row:Row)=>row.id),signal(()=>true),{page,active:()=>{},selected:()=>{}}));TestBed.tick();
  const fixture=TestBed.createComponent(CollectionFooter<Row>);fixture.componentRef.setInput('controller',model);fixture.componentRef.setInput('recordNavigation',true);
  fixture.componentInstance.paginate({page:1,rows:1});expect(model.activeId()).toBe(2);expect(page).not.toHaveBeenCalled();
  fixture.componentInstance.paginate({page:11,rows:1});expect(page).toHaveBeenCalledExactlyOnceWith({pageIndex:1,pageSize:10});
  page.mockClear();fixture.componentInstance.paginate({page:1,rows:10});expect(page).not.toHaveBeenCalled();
  fixture.componentRef.setInput('recordNavigation',false);fixture.componentInstance.paginate({page:1,rows:10});expect(page).toHaveBeenCalledExactlyOnceWith({pageIndex:1,pageSize:10});
 });
 it('renders reusable inline actions, guards disabled or stale callbacks and keeps action colspan independent from its width',async()=>{
  const fixture=TestBed.createComponent(MyDataGrid<Row>),callback=vi.fn();fixture.componentRef.setInput('source',{query,kind:'ready',result:{query,rows,total:2,hasNextPage:false}});fixture.componentRef.setInput('label','Actions fixture');fixture.componentRef.setInput('columns',[{key:'id',header:'ID',value:(row:Row)=>row.id},{key:'name',header:'Name',value:(row:Row)=>row.name}]);fixture.componentRef.setInput('rowId',(row:Row)=>row.id);
  fixture.componentRef.setInput('contextActions',()=>[{id:'view',label:'View',icon:'view'},{id:'edit',label:'Edit',icon:'edit',disabled:true}]);fixture.componentRef.setInput('actionDisplay','inline');fixture.componentRef.setInput('stickyActions',true);fixture.componentInstance.rowAction.subscribe(callback);await fixture.whenStable();
  const root=fixture.nativeElement as HTMLElement;expect(root.querySelectorAll('erp-row-actions')).toHaveLength(2);expect(root.querySelector<HTMLButtonElement>('[data-row-action=edit] button')?.disabled).toBe(true);root.querySelector<HTMLButtonElement>('[data-row-action=view] button')!.click();expect(callback).toHaveBeenCalledExactlyOnceWith({row:rows[0],action:'view'});
  fixture.componentInstance.activateRowAction(rows[0],'edit');expect(callback).toHaveBeenCalledOnce();expect(fixture.componentInstance.actionColumnWidth()).toBeGreaterThanOrEqual(128);
  fixture.componentRef.setInput('grouping',{field:'name',mode:'subheader',scope:'page'});await fixture.whenStable();expect(root.querySelector<HTMLTableCellElement>('.group-row td')?.colSpan).toBe(3);
  fixture.componentRef.setInput('source',{query,kind:'loading'});await fixture.whenStable();fixture.componentInstance.activateRowAction(rows[0],'view');expect(callback).toHaveBeenCalledOnce();
 });
 it('shares immediate modal presentation settings and resets layout without changing owner data or filters',async()=>{
  const fixture=TestBed.createComponent(Fixture);await fixture.whenStable();const owner=fixture.componentInstance,grid=owner.grid(),source=owner.source();
  const frame=fixture.debugElement.query(By.directive(CollectionFrame)).componentInstance as CollectionFrame<Row>;
  const filters:GridFilters=[{field:'name',operator:'and',constraints:[{matchMode:'contains',value:'First'}]}];owner.filters.set(filters);
  frame.changeDensity('compact');frame.toggleColumn('name',false);frame.pin('name','start');grid.moveColumn({key:'name',direction:-1});await fixture.whenStable();
  expect(grid.rowHeight()).toBe(36);expect(grid.visibleKeys()).toEqual(['id']);expect(grid.pins()).toEqual({name:'start'});expect(frame.columns().map(column=>column.key)).toEqual(['name','id']);
  frame.columnSearch.set('NAME');expect(frame.optionColumns().map(column=>column.key)).toEqual(['name']);
  frame.resetOptions();await fixture.whenStable();expect(frame.columnSearch()).toBe('');expect(grid.rowHeight()).toBe(52);expect(grid.visibleKeys()).toEqual(['id','name']);expect(grid.pins()).toEqual({});expect(grid.order()).toEqual(['id','name']);
  expect(owner.source()).toBe(source);expect(owner.filters()).toBe(filters);expect(owner.filterChanged).not.toHaveBeenCalled();
 });
 it('emits typed native AND/OR rules to the owner while preserving the supplied remote page and rejecting invalid conditions',async()=>{
  const fixture=TestBed.createComponent(Fixture);await fixture.whenStable();const owner=fixture.componentInstance,grid=owner.grid();
  expect((fixture.nativeElement as HTMLElement).querySelectorAll('p-column-filter')).toHaveLength(1);
  grid.changeFilters({filters:{name:[{value:'F',matchMode:'startsWith',operator:'or'},{value:'d',matchMode:'endsWith',operator:'or'}]}});await fixture.whenStable();
  expect(owner.filterChanged).toHaveBeenCalledOnce();expect(owner.filters()[0].constraints).toHaveLength(2);expect(grid.rows()).toEqual(rows);
  grid.changeFilters({filters:{name:[{value:'x'.repeat(201),matchMode:'contains',operator:'and'}]}});expect(grid.filterInvalid()).toBe(true);expect(owner.filterChanged).toHaveBeenCalledOnce();
  owner.source.set({...owner.source(),kind:'forbidden'});await fixture.whenStable();grid.changeFilters({filters:{name:[{value:'A',matchMode:'contains',operator:'and'}]}});expect(owner.filterChanged).toHaveBeenCalledOnce();
 });
 it('keeps owner rows immutable across detail expansion and clears details/presentation at a new scope',async()=>{
  const fixture=TestBed.createComponent(Fixture);await fixture.whenStable();const owner=fixture.componentInstance,grid=owner.grid();
  grid.toggleDetails(rows[0]);await fixture.whenStable();expect((fixture.nativeElement as HTMLElement).querySelector('.details')?.textContent).toBe('First');
  grid.moveColumn({key:'name',direction:-1});grid.pinColumn({key:'id',side:'start'});const snapshot=grid.presentation();expect(snapshot.order).toEqual(['name','id']);expect(snapshot.pinned).toEqual({id:'start'});
  grid.resetDisplay();expect(grid.restorePresentation(snapshot)).toBe(true);expect(grid.order()).toEqual(['name','id']);
  const other={...query,scopeKey:'actor2'};owner.source.set({query:other,kind:'ready',result:{query:other,rows,total:2,hasNextPage:false}});await fixture.whenStable();
  expect(grid.expanded()).toEqual({});expect(grid.order()).toEqual(['id','name']);expect(grid.pins()).toEqual({});expect(grid.restorePresentation(snapshot)).toBe(false);expect(rows).toEqual([{id:1,name:'First'},{id:2,name:'Second'}]);
 });
 it('keeps radio/single selection exclusive and range selection on the current eligible page only',async()=>{
  const fixture=TestBed.createComponent(Fixture);await fixture.whenStable();const owner=fixture.componentInstance,grid=owner.grid();
  owner.selectionMode.set('radio');await fixture.whenStable();grid.controller.toggle(1,true);grid.controller.toggle(2,true);expect(grid.controller.selectedIds()).toEqual([2]);grid.controller.selectPage(true);expect(grid.controller.selectedIds()).toEqual([2]);
  owner.selectionMode.set('range');await fixture.whenStable();expect(grid.controller.selectedIds()).toEqual([]);grid.controller.toggle(1,true);grid.controller.selectRange(2);expect(grid.controller.selectedIds()).toEqual([1,2]);
  owner.source.set({...owner.source(),kind:'loading'});await fixture.whenStable();expect(grid.controller.selectedIds()).toEqual([]);grid.controller.selectRange(1);expect(grid.controller.selectedIds()).toEqual([]);
 });
 it('splits only current-page frozen IDs and rejects incompatible grouped details or noncontiguous groups',async()=>{
  const fixture=TestBed.createComponent(Fixture);await fixture.whenStable();const owner=fixture.componentInstance,grid=owner.grid();
  owner.frozen.set([1,999]);await fixture.whenStable();expect(grid.frozenRows()).toEqual([rows[0]]);expect(grid.scrollingRows()).toEqual([rows[1]]);expect(grid.controller.view().total).toBe(2);
  owner.grouping.set({field:'name',mode:'subheader',scope:'page'});await fixture.whenStable();expect(grid.groupingValid()).toBe(false);expect((fixture.nativeElement as HTMLElement).querySelector('p-table')).toBeNull();
  owner.frozen.set([]);owner.detailsEnabled.set(false);await fixture.whenStable();expect(grid.groupingValid()).toBe(true);
  const data=[{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'A'}];owner.source.set({query,kind:'ready',result:{query,rows:data,total:3,hasNextPage:false}});await fixture.whenStable();expect(grid.groupingValid()).toBe(false);
 });
});

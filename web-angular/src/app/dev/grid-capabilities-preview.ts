import { Component,computed,DestroyRef,inject,signal,viewChild } from '@angular/core';
import { LocalizationRuntime,UiTextPipe } from '../platform/localization/public-api';
import { ThemeService } from '../../theme/public-api';
import {
 ActionButton,AppIcon,CollectionCell,CollectionRowDetails,CollectionColumnHeader,CollectionColumnFooter,MyDataGrid,PageHeader,StatusBadge,OptionSelect,
 parseGridFilters,type CollectionColumn,type CollectionPageRequest,type CollectionSearch,type CollectionSearchChange,type CollectionSource,
 type GridFilters,type GridFilterGroup,type GridSortItem,type GridDisplayOptions,type GridPresentation,type PageViewOption,type GridRowAction,type GridSelectionMode,type GridRowGroup,type GridHeaderDefinition,
} from '../shared/ui/public-api';
interface RecordFixture {readonly id:number;readonly name:string;readonly amount:number;readonly day:string;readonly enabled:boolean;}
const records:readonly RecordFixture[]=Object.freeze(Array.from({length:137},(_,index)=>({id:index+1,name:String.fromCharCode(65+index%3)+' · '+String(index+1).padStart(3,'0'),amount:index-10,day:'2026-'+String(index%12+1).padStart(2,'0')+'-15',enabled:index%3!==0})));
function matches(row:RecordFixture,group:GridFilterGroup):boolean{
 const field=group.field as keyof RecordFixture,value=row[field];
 const test=(mode:string,target:string|number|boolean)=>{
  const left=String(value).toLocaleLowerCase(),right=String(target).toLocaleLowerCase();
  switch(mode){case'startsWith':return left.startsWith(right);case'contains':return left.includes(right);case'notContains':return !left.includes(right);case'endsWith':return left.endsWith(right);case'equals':case'dateIs':return value===target;case'notEquals':case'dateIsNot':return value!==target;case'lt':case'dateBefore':return value<target;case'lte':return value<=target;case'gt':case'dateAfter':return value>target;case'gte':return value>=target;default:return false;}
 };
 return group.operator==='or'?group.constraints.some(rule=>test(rule.matchMode,rule.value)):group.constraints.every(rule=>test(rule.matchMode,rule.value));
}
/** Neutral remote-service simulation; never used by production adapters or business routes. */
@Component({imports:[ActionButton,AppIcon,CollectionCell,CollectionRowDetails,CollectionColumnHeader,CollectionColumnFooter,MyDataGrid,PageHeader,StatusBadge,OptionSelect,UiTextPipe],template:`
 <main>
  <erp-page-header variant="collection" [title]="'pagination.dataTable'|uiText" [views]="views()" view="grid" [total]="total()" [totalLabel]="'pagination.items'|uiText" [filterVisible]="toolbar()" (refresh)="request()" (filterToggle)="toolbar.set(!toolbar())" />
  <div class="panel"><erp-data-table #grid appearance="reference" [label]="'pagination.dataTable'|uiText" [source]="source()" [columns]="columns()" [rowId]="id" [rowLabel]="name" [search]="search()" [toolbarVisible]="toolbar()" [selectionEnabled]="true" [selectionMode]="selectionMode()" [advancedFilters]="true" [filters]="filters()" sortMode="multiple" [sorts]="sorts()" [display]="display()" [csv]="{filename:'grid-fixture'}" [frozenIds]="frozenIds()" [grouping]="grouping()" [contextActions]="rowActions" [headerGroups]="headerGroups()"
   (pageChange)="page($event)" (searchChange)="searchChanged($event)" (filtersChange)="filterChanged($event)" (sortsChange)="sortChanged($event)" (retry)="request()" (detailToggle)="details.set($event.expanded?$event.row.id:null)" (rowAction)="lastAction.set($event.action+':'+$event.row.id)">
   <div toolbarContent class="actions"><erp-button data-testid="reset" [label]="'general.reset'|uiText" variant="text" (activated)="reset()"><erp-icon buttonIcon name="reset" /></erp-button></div>
   <div gridOptions class="fixture-options"><erp-button data-testid="pin" [label]="'collections.pinStart'|uiText" variant="text" (activated)="pin()" /><erp-button data-testid="save" [label]="'actions.save'|uiText" variant="text" (activated)="save()" /><erp-button data-testid="restore" [label]="'actions.restore'|uiText" variant="text" (activated)="restore()" /></div>
   <ng-template [erpCollectionCell]="columns()[4]" let-row><erp-status-badge [label]="(row.enabled?'common.active':'common.inactive')|uiText" /></ng-template>
   @if(headerGroups().length){<ng-template [erpCollectionColumnHeader]="columns()[0]" let-column><span data-testid="projected-header">{{column.header}}</span></ng-template><ng-template [erpCollectionColumnFooter]="columns()[2]" let-page let-total="total"><output data-testid="projected-footer">{{page.length}} / {{total}}</output></ng-template>}
   @if(!grouping()){<ng-template [erpCollectionRowDetails]="source()" let-row><div data-testid="row-detail">{{row.name}} · {{row.day}} · {{row.amount}}</div></ng-template>}
  </erp-data-table></div>
  <div class="fixture-controls"><erp-button data-testid="scope" [label]="'general.reset'|uiText" variant="text" (activated)="replaceScope()" /><erp-button data-testid="language" [label]="(locale.language()==='en'?'common.arabic':'common.english')|uiText" variant="text" (activated)="locale.setLanguage(locale.language()==='en'?'ar':'en')" /><erp-button data-testid="mode" [label]="'general.darkMode'|uiText" variant="text" (activated)="theme.setMode(theme.mode()==='light'?'dark':'light')" /><erp-button data-testid="freeze-row" [label]="'collections.pinStart'|uiText" variant="text" (activated)="freezeRow()" /><erp-button data-testid="group" [label]="'collections.columns'|uiText" variant="text" (activated)="group()" /><erp-button data-testid="header-groups" [label]="'collections.columns'|uiText" variant="text" (activated)="toggleHeaderGroups()" /><erp-option-select data-testid="selection-mode" [label]="'collections.selectionMode'|uiText" [value]="selectionMode()" [options]="selectionOptions()" (valueChange)="selectMode($event)" /></div>
  <output data-testid="grid-state" [attr.data-starts]="starts()" [attr.data-kind]="source().kind" [attr.data-filters]="filterJson()" [attr.data-sorts]="sortJson()" [attr.data-detail]="details()" [attr.data-scope]="scope()" [attr.data-action]="lastAction()"></output>
 </main>`,styles:`:host{display:block;height:100dvh;min-width:0}main{height:100%;display:flex;flex-direction:column;min-height:0;min-width:0;padding:24px;box-sizing:border-box}.panel{flex:1;min-height:0}.fixture-controls{display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;padding-top:8px}.fixture-options{display:flex;flex-direction:column}.actions{display:flex;--action-min-height:36px;--action-font-size:11.2px}@media(max-width:599px){main{padding:12px}.fixture-controls{--action-min-height:32px;gap:4px}}`})
export class GridCapabilitiesPreview {
 readonly locale=inject(LocalizationRuntime);readonly theme=inject(ThemeService);readonly grid=viewChild.required<MyDataGrid<RecordFixture>>('grid');
 readonly columns=computed<readonly CollectionColumn<RecordFixture>[]>(()=>[
  {key:'id',header:this.locale.translate('general.id'),value:row=>row.id,sortField:'id',width:72,align:'center',hideable:false,filter:{field:'id',type:'number',maxConstraints:4}},
  {key:'name',header:this.locale.translate('general.nameEn'),value:row=>row.name,sortField:'name',width:230,align:'center',filter:{field:'name',type:'text',maxLength:200,maxConstraints:4}},
  {key:'amount',header:this.locale.translate('numericField.title'),value:row=>row.amount,sortField:'amount',width:160,align:'center',filter:{field:'amount',type:'number',maxConstraints:4}},
  {key:'day',header:this.locale.translate('general.createdOn'),value:row=>row.day,sortField:'day',width:170,align:'center',filter:{field:'day',type:'date',maxConstraints:4}},
  {key:'enabled',header:this.locale.translate('common.active'),value:row=>row.enabled?1:0,width:150,align:'center',filter:{field:'enabled',type:'boolean',maxConstraints:1}},
 ]);
 readonly headerGroups=signal<readonly GridHeaderDefinition[]>([]);
 readonly id=(row:RecordFixture)=>row.id;readonly name=(row:RecordFixture)=>row.name;
 readonly scope=signal('fixture-a');readonly filters=signal<GridFilters>([]);readonly sorts=signal<readonly GridSortItem[]>([{field:'id',direction:'asc'}]);readonly searchText=signal('');readonly source=signal<CollectionSource<RecordFixture>>({query:{scopeKey:'fixture-a',criteriaKey:'all',pageIndex:0,pageSize:10},kind:'loading'});
 readonly selectionMode=signal<GridSelectionMode>('multiple');readonly frozenIds=signal<readonly number[]>([]);readonly grouping=signal<GridRowGroup|null>(null);readonly lastAction=signal('');
 readonly rowActions=(_row:RecordFixture):readonly GridRowAction[]=>[{id:'view',label:this.locale.translate('actions.view'),icon:'view'}];
 readonly selectionOptions=computed(()=>['multiple','single','radio','range'].map(value=>({value,label:this.locale.translate('collections.selection'+value[0].toUpperCase()+value.slice(1))})));
 readonly starts=signal(0);readonly details=signal<number|null>(null);readonly toolbar=signal(true);readonly display=signal<GridDisplayOptions>({resizableColumns:'expand',reorderableColumns:true});readonly saved=signal<GridPresentation|null>(null);
 readonly total=computed(()=>this.source().result?.total??0);readonly filterJson=computed(()=>JSON.stringify(this.filters()));readonly sortJson=computed(()=>JSON.stringify(this.sorts()));
 readonly views=computed<readonly PageViewOption[]>(()=>[{id:'grid',label:this.locale.translate('views.grid'),icon:'grid'}]);
 readonly search=computed<CollectionSearch>(()=>({value:this.searchText(),maxLength:200,placeholder:this.locale.translate('search.searchText')}));
 private generation=0;private timer:ReturnType<typeof setTimeout>|undefined;
 constructor(){void this.locale.loadNamespace('core');this.request();inject(DestroyRef).onDestroy(()=>{this.generation++;clearTimeout(this.timer);});}
 page(page:CollectionPageRequest){this.source.update(value=>({...value,query:{...value.query,...page}}));this.request();}
 searchChanged(change:CollectionSearchChange){if('value'in change){this.searchText.set(change.value);this.commit();}}
 filterChanged(filters:GridFilters){this.filters.set(parseGridFilters(filters,this.columns().flatMap(column=>column.filter?[column.filter]:[])));this.commit();}
 sortChanged(sorts:readonly GridSortItem[]){this.sorts.set(sorts);this.commit();}
 private commit(){this.details.set(null);this.source.update(value=>({...value,query:{...value.query,scopeKey:this.scope(),pageIndex:0,criteriaKey:JSON.stringify([this.filters(),this.sorts(),this.searchText()])}}));this.request();}
 reset(){this.grouping.set(null);this.frozenIds.set([]);this.filters.set([]);this.sorts.set([{field:'id',direction:'asc'}]);this.searchText.set('');this.commit();}
 selectMode(value:string){if(value==='multiple'||value==='single'||value==='radio'||value==='range')this.selectionMode.set(value);}
 freezeRow(){this.grouping.set(null);this.frozenIds.set(this.frozenIds().length?[]:[this.source().result?.rows[0]?.id??1]);}
 group(){this.frozenIds.set([]);this.grouping.set(this.grouping()?null:{field:'day',mode:'subheader',scope:'page',expandable:true});this.sorts.set(this.grouping()?[{field:'day',direction:'asc'},{field:'id',direction:'asc'}]:[{field:'id',direction:'asc'}]);this.commit();}
 toggleHeaderGroups(){const enabled=!this.headerGroups().length;this.display.set({resizableColumns:'expand',reorderableColumns:!enabled});this.headerGroups.set(enabled?[{id:'identity',label:this.locale.translate('collections.columns'),children:['id',{id:'names',label:this.locale.translate('general.nameEn'),children:['name']}]},{id:'values',label:this.locale.translate('numericField.title'),children:['amount','day']},'enabled']:[]);}
 replaceScope(){this.scope.update(value=>value==='fixture-a'?'fixture-b':'fixture-a');this.reset();}
 pin(){this.display.update(value=>({...value,frozenColumns:value.frozenColumns?undefined:{id:'start'}}));}
 save(){this.saved.set(this.grid().presentation());}
 restore(){if(this.saved())this.grid().restorePresentation(this.saved());}
 request(){
  const generation=++this.generation;clearTimeout(this.timer);this.starts.update(value=>value+1);const query={...this.source().query},filters=this.filters(),sorts=this.sorts(),search=this.searchText().toLocaleLowerCase();
  this.source.set({query,kind:'loading'});
  this.timer=setTimeout(()=>{if(generation!==this.generation)return;
   // Simulated remote owner: apply criteria to ALL fixture records before paging.
   const result=records.filter(row=>filters.every(group=>matches(row,group))&&(!search||row.name.toLocaleLowerCase().includes(search)));
   result.sort((left,right)=>{for(const sort of sorts){const key=sort.field as keyof RecordFixture,a=left[key],b=right[key],comparison=typeof a==='number'&&typeof b==='number'?a-b:String(a).localeCompare(String(b));if(comparison)return comparison*(sort.direction==='asc'?1:-1);}return left.id-right.id;});
   const start=query.pageIndex*query.pageSize;this.source.set({query,kind:'ready',result:{query,rows:result.slice(start,start+query.pageSize),total:result.length,hasNextPage:start+query.pageSize<result.length}});
  },180);
 }
}

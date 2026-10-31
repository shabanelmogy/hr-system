import { Component,computed,DestroyRef,inject,signal } from '@angular/core';
import { themePaletteOrder } from '@app/tokens';
import { LocalizationRuntime,UiTextPipe } from '../platform/localization/public-api';
import { ThemeService } from '../../theme/public-api';
import { ActionButton,CardList,CollectionCardTemplate,CollectionCell,CollectionEmptyTemplate,FeedbackState,MyDataGrid,OptionSelect,PageHeader,StatusBadge,type CollectionColumn,type CollectionId,type CollectionPageRequest,type CollectionQuery,type CollectionSearch,type CollectionSearchChange,type CollectionSort,type CollectionSource } from '../shared/ui/public-api';

interface SampleRecord {readonly id:number;readonly name:string;readonly active:boolean;}
type Scenario='ready'|'unknown'|'empty'|'error'|'forbidden'|'loading'|'out-of-range';
// Neutral fixtures belong only to this development route, never a business API adapter.
const fixture:readonly SampleRecord[]=Array.from({length:37},(_,i)=>({id:i+1,name:`${String.fromCharCode(65+i%3)} · ${String(i+1).padStart(2,'0')}`,active:i%3!==0}));
@Component({imports:[ActionButton,CardList,CollectionCardTemplate,CollectionCell,CollectionEmptyTemplate,FeedbackState,MyDataGrid,OptionSelect,PageHeader,StatusBadge,UiTextPipe],template:`
 <main>
  <erp-page-header [title]="'pagination.dataTable'|uiText"><div class="preferences">
   <erp-button [label]="(runtime.language()==='en'?'common.arabic':'common.english')|uiText" data-testid="language" (activated)="runtime.setLanguage(runtime.language()==='en'?'ar':'en')" />
   <erp-button [label]="(theme.mode()==='light'?'general.darkMode':'general.lightMode')|uiText" data-testid="mode" (activated)="theme.setMode(theme.mode()==='light'?'dark':'light')" />
   @for(palette of palettes;track palette){<erp-button [label]="('menu.palettes.'+palette)|uiText" [pressed]="theme.palette()===palette" [attr.data-palette]="palette" (activated)="theme.setPalette(palette)" />}
  </div></erp-page-header>
  <div class="tools">
   <erp-button [label]="'views.grid'|uiText" [pressed]="view()==='grid'" data-testid="grid-view" (activated)="view.set('grid')" />
   <erp-button [label]="'views.cards'|uiText" [pressed]="view()==='cards'" data-testid="cards-view" (activated)="view.set('cards')" />
   @for(item of scenarios;track item.value){<erp-button [label]="item.label|uiText" [pressed]="scenario()===item.value" [attr.data-scenario]="item.value" (activated)="changeScenario(item.value)" />}
   <erp-button [label]="'general.reset'|uiText" data-testid="scope" (activated)="replaceScope()" />
  </div>
  <div class="preview" data-testid="collection">
   @if(view()==='grid'){
    <erp-data-table [recordNavigation]="true" [source]="source()" [label]="'pagination.dataTable'|uiText" [columns]="columns()" [rowId]="id" [rowLabel]="name" [selectable]="selectable" [selectionEnabled]="true" [sort]="sort()" [search]="search()" (pageChange)="page($event)" (sortChange)="sortBy($event)" (searchChange)="criteria($event)" (retry)="retry()" (activeChange)="active.set($event)" (selectionChange)="selected.set($event)" (rowActivated)="opened.set($event.id)">
     <erp-button toolbarContent [label]="'actions.refresh'|uiText" data-testid="refresh" (activated)="request()" />
     <erp-option-select toolbarFilters [label]="'collections.filters'|uiText" [options]="filterOptions()" [value]="filter()" (valueChange)="filterBy($event)" data-testid="filter" />
     <ng-template [erpCollectionCell]="columns()[2]" let-row><erp-status-badge [label]="(row.active?'common.active':'common.inactive')|uiText" [accent]="row.active?'var(--success)':'var(--muted-foreground)'" /></ng-template>
     <ng-template [erpCollectionCell]="columns()[3]" let-row><erp-button [label]="'collections.rowActions'|uiText" variant="text" [attr.data-action-id]="row.id" (activated)="opened.set(row.id)" /></ng-template>
     <ng-template erpCollectionEmpty><erp-feedback-state kind="empty" [title]="'pagination.noData'|uiText" /></ng-template>
    </erp-data-table>
   }@else{
    <erp-card-list [recordNavigation]="true" [source]="source()" [label]="'views.cards'|uiText" [rowId]="id" [rowLabel]="name" [selectable]="selectable" [selectionEnabled]="true" [search]="search()" (pageChange)="page($event)" (searchChange)="criteria($event)" (retry)="retry()" (activeChange)="active.set($event)" (selectionChange)="selected.set($event)" (rowActivated)="opened.set($event.id)">
     <erp-button toolbarContent [label]="'actions.refresh'|uiText" (activated)="request()" />
     <erp-option-select toolbarFilters [label]="'collections.filters'|uiText" [options]="filterOptions()" [value]="filter()" (valueChange)="filterBy($event)" />
     <ng-template [erpCollectionCard]="source()" let-row><div class="card-content"><erp-status-badge [label]="(row.active?'common.active':'common.inactive')|uiText" [accent]="row.active?'var(--success)':'var(--muted-foreground)'" /><erp-button [label]="'collections.rowActions'|uiText" variant="text" [attr.data-action-id]="row.id" (activated)="opened.set(row.id)" /></div></ng-template>
    </erp-card-list>
   }
  </div>
  <output data-testid="state" [attr.data-kind]="source().kind" [attr.data-page]="source().query.pageIndex" [attr.data-requests]="requests()" [attr.data-active]="active()" [attr.data-selected]="selected().join(',')" [attr.data-opened]="opened()" [attr.data-scope]="source().query.scopeKey"></output>
 </main>`,styles:`
 main{max-width:1600px;margin-inline:auto;padding:24px;min-width:0}.preferences,.tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.tools{margin-bottom:16px;--action-min-height:36px}.preview{height:620px;min-height:0;min-width:0}.card-content{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}erp-option-select[toolbarFilters]{display:block;max-width:260px;padding:4px 8px 8px;--touch-target:36px;--option-label-background:var(--surface)}@media(max-width:599px){main{padding:12px}.preview{height:750px}.preferences{gap:4px}}
 `})
export class CollectionPreview{
 readonly runtime=inject(LocalizationRuntime);readonly theme=inject(ThemeService);readonly palettes=themePaletteOrder;
 readonly view=signal<'grid'|'cards'>('grid');readonly scenario=signal<Scenario>('ready');readonly filter=signal('all');readonly searchText=signal('');readonly field=signal('name');readonly operator=signal('contains');readonly sort=signal<CollectionSort>({field:'id',direction:'asc'});
 readonly source=signal<CollectionSource<SampleRecord>>({query:{scopeKey:'fixture-a',criteriaKey:'all',pageIndex:0,pageSize:10},kind:'loading'});
 readonly active=signal<CollectionId|null>(null);readonly selected=signal<readonly CollectionId[]>([]);readonly opened=signal<number|null>(null);readonly requests=signal(0);
 readonly id=(row:SampleRecord)=>row.id;readonly name=(row:SampleRecord)=>row.name;readonly selectable=(row:SampleRecord)=>row.id%7!==0;
 readonly columns=computed<readonly CollectionColumn<SampleRecord>[]>(()=>[
  {key:'id',header:'#',value:row=>row.id,sortField:'id',width:80,hideable:false},
  {key:'name',header:this.runtime.translate('general.nameEn'),value:row=>row.name,sortField:'name',width:220},
  {key:'active',header:this.runtime.translate('common.active'),value:row=>row.active?1:0,width:160},
  {key:'actions',header:this.runtime.translate('collections.rowActions'),value:()=>'',width:190},
 ]);
 readonly filterOptions=computed(()=>[{value:'all',label:this.runtime.translate('common.all')},{value:'active',label:this.runtime.translate('common.active')},{value:'inactive',label:this.runtime.translate('common.inactive')}]);
 readonly search=computed<CollectionSearch>(()=>({value:this.searchText(),placeholder:this.runtime.translate('search.searchText'),field:{label:this.runtime.translate('search.searchField'),value:this.field(),options:[{value:'name',label:this.runtime.translate('general.nameEn')},{value:'id',label:'#'}]},operator:{label:this.runtime.translate('search.searchType'),value:this.operator(),options:[{value:'contains',label:this.runtime.translate('search.contains')},{value:'equals',label:this.runtime.translate('search.equals')}]}}));
 readonly scenarios:readonly{value:Scenario;label:string}[]=[{value:'ready',label:'common.all'},{value:'unknown',label:'pagination.unknownTotal'},{value:'empty',label:'pagination.noData'},{value:'error',label:'common.error'},{value:'forbidden',label:'authorization.forbidden.title'},{value:'loading',label:'common.loading'},{value:'out-of-range',label:'pagination.last'}];
 private generation=0;private timer:ReturnType<typeof setTimeout>|undefined;private debounce:ReturnType<typeof setTimeout>|undefined;
 constructor(){void this.runtime.loadNamespace('core');this.request();inject(DestroyRef).onDestroy(()=>{this.generation++;clearTimeout(this.timer);clearTimeout(this.debounce);});}
 page(request:CollectionPageRequest){this.source.update(source=>({...source,query:{...source.query,...request}}));this.request();}
 sortBy(sort:CollectionSort){this.sort.set(sort);this.commitCriteria();}
 criteria(change:CollectionSearchChange){
  if('value'in change){this.searchText.set(change.value);clearTimeout(this.debounce);this.debounce=setTimeout(()=>this.commitCriteria(),180);}
  else{if('field'in change)this.field.set(change.field);else this.operator.set(change.operator);this.commitCriteria();}
 }
 filterBy(value:string){if(!['all','active','inactive'].includes(value))return;this.filter.set(value);this.commitCriteria();}
 private commitCriteria(){clearTimeout(this.debounce);const criteriaKey=JSON.stringify([this.searchText(),this.field(),this.operator(),this.filter(),this.sort(),this.scenario()]);this.source.update(source=>({...source,query:{...source.query,criteriaKey,pageIndex:this.scenario()==='out-of-range'?4:0}}));this.request();}
 changeScenario(scenario:Scenario){this.scenario.set(scenario);this.commitCriteria();}
 replaceScope(){this.source.update(source=>({...source,query:{...source.query,scopeKey:source.query.scopeKey==='fixture-a'?'fixture-b':'fixture-a',pageIndex:0}}));this.request();}
 retry(){this.scenario.set('ready');this.commitCriteria();}
 request(){
  const generation=++this.generation;clearTimeout(this.timer);this.requests.update(value=>value+1);
  const query:CollectionQuery={...this.source().query},scenario=this.scenario(),text=this.searchText().trim().toLowerCase(),field=this.field(),operator=this.operator(),filter=this.filter(),sort=this.sort();
  this.source.update(source=>({...source,kind:'loading'}));if(scenario==='loading')return;
  this.timer=setTimeout(()=>{
   if(generation!==this.generation)return;
   if(scenario==='error'||scenario==='forbidden'){this.source.set({query,kind:scenario});return;}
   // Simulated server: filter/sort the full fixture here; Shared never filters a page.
   const all=fixture.filter(row=>(filter==='all'||row.active===(filter==='active'))&&(!text||(operator==='equals'?String(field==='id'?row.id:row.name).toLowerCase()===text:String(field==='id'?row.id:row.name).toLowerCase().includes(text))));
   all.sort((a,b)=>(sort.field==='name'?a.name.localeCompare(b.name):a.id-b.id)*(sort.direction==='asc'?1:-1));
   const available=scenario==='empty'?[]:all,start=query.pageIndex*query.pageSize;
   this.source.set({query,kind:'ready',result:{query,rows:scenario==='out-of-range'?[]:available.slice(start,start+query.pageSize),total:scenario==='unknown'?null:scenario==='out-of-range'?2:available.length,hasNextPage:start+query.pageSize<available.length}});
  },220);
 }
}

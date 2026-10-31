import { NgTemplateOutlet } from '@angular/common';
import { Component,computed,DestroyRef,effect,inject,signal,untracked } from '@angular/core';
import { ActivatedRoute,NavigationEnd,Router,RouterOutlet } from '@angular/router';import { toSignal } from '@angular/core/rxjs-interop';import { filter,map } from 'rxjs';
import { themePaletteOrder } from '@app/tokens';import { ThemeService } from '../../theme/public-api';import { LocalizationRuntime,UiTextPipe } from '../platform/localization/public-api';
import { createCollectionCriteriaCodec,createRouteCollectionCriteria,type CollectionCriteria,type CriteriaFilter,type CriteriaNavigationResult } from '../shared/data/public-api';
import { ActionButton,MyDataGrid,CardList,CollectionCardTemplate,OptionSelect,PageHeader,StatusBadge,FeedbackState,type CollectionColumn,type CollectionPageRequest,type CollectionSort,type CollectionSearch,type CollectionSearchChange,type CollectionSource } from '../shared/ui/public-api';
import { CriteriaPreviewGate } from './criteria-preview-gate';
interface Sample{readonly id:number;readonly name:string;readonly active:boolean|null;}
// A neutral simulated server, never a production list adapter or business dataset.
const fixtures:readonly Sample[]=Array.from({length:37},(_,id)=>({id,name:`A · ${String(id).padStart(2,'0')}`,active:id===36?null:id%3!==0}));
const codec=createCollectionCriteriaCodec({pageSizes:[5,10,25,50],defaultPageSize:10,sortFields:['id','name'],defaultSort:{field:'id',direction:'asc'},search:{url:'approved-public',fields:['name'],operators:['contains'],maxLength:128},filters:[{field:'active',url:'approved-public',operators:['equals'],kind:'boolean',nullable:true},{field:'id',url:'approved-public',operators:['equals'],kind:'integer',nullable:false,min:0,max:36}]});
@Component({imports:[NgTemplateOutlet,RouterOutlet,ActionButton,MyDataGrid,CardList,CollectionCardTemplate,OptionSelect,PageHeader,StatusBadge,FeedbackState,UiTextPipe],template:`
 <main><erp-page-header [title]="'pagination.dataTable'|uiText" /><div class="tools">
 @for(palette of palettes;track palette){<erp-button [label]="('menu.palettes.'+palette)|uiText" [attr.data-palette]="palette" (activated)="theme.setPalette(palette)" />}
 <erp-button data-testid="language" [label]="(runtime.language()==='en'?'common.arabic':'common.english')|uiText" (activated)="runtime.setLanguage(runtime.language()==='en'?'ar':'en')" />
 <erp-button data-testid="grid" [label]="'views.grid'|uiText" (activated)="view.set('grid')" /><erp-button data-testid="cards" [label]="'views.cards'|uiText" (activated)="view.set('cards')" />
 <erp-button data-testid="scope" [label]="'general.company'|uiText" (activated)="scope.set(scope()==='a'?'b':'a')" />
 <erp-button data-testid="permission" [label]="'authorization.forbidden.title'|uiText" (activated)="allowed.set(!allowed())" />
 <erp-button data-testid="deny" [label]="'common.cancel'|uiText" (activated)="gate.allowed=!gate.allowed" />
 <erp-button data-testid="wait" [label]="'common.loading'|uiText" (activated)="gate.waitMs=gate.waitMs?0:900" /></div>
 @if(!editorOpen()){
 @if(!criteria.resolution().valid){<erp-feedback-state [title]="'common.error'|uiText" kind="error" />}
 <div class="collection" data-testid="collection">
 @if(view()==='grid'){
 <erp-data-table [source]="source()" [label]="'pagination.dataTable'|uiText" [columns]="columns()" [rowId]="id" [rowLabel]="name" [sort]="criteria.applied().sort ?? undefined" [search]="search()" (searchChange)="draft($event)" (sortChange)="sort($event)" (pageChange)="page($event)" (retry)="refresh()" (rowActivated)="open($event.id)">
 <ng-container toolbarContent><ng-container [ngTemplateOutlet]="actions" /></ng-container>
 <ng-container toolbarFilters><ng-container [ngTemplateOutlet]="filters" /></ng-container>
 </erp-data-table>
 }@else{
 <erp-card-list [source]="source()" [label]="'pagination.dataTable'|uiText" [rowId]="id" [rowLabel]="name" [search]="search()" (searchChange)="draft($event)" (pageChange)="page($event)" (retry)="refresh()" (rowActivated)="open($event.id)">
 <ng-container toolbarContent><ng-container [ngTemplateOutlet]="actions" /></ng-container>
 <ng-container toolbarFilters><ng-container [ngTemplateOutlet]="filters" /></ng-container>
 <ng-template [erpCollectionCard]="source()" let-row><erp-status-badge [label]="(row.active===null?'pagination.unknownTotal':row.active?'common.active':'common.inactive')|uiText" [accent]="row.active===true?'var(--success)':'var(--muted-foreground)'" /></ng-template>
 </erp-card-list>
 }</div>}
 <ng-template #actions><erp-button data-testid="apply" [label]="'general.search'|uiText" (activated)="apply()" /><erp-button data-testid="reset" [label]="'general.reset'|uiText" (activated)="reset()" /><erp-button data-testid="refresh" [label]="'actions.refresh'|uiText" (activated)="refresh()" /><erp-button data-testid="editor" [label]="'actions.view'|uiText" (activated)="open(0)" /></ng-template>
 <ng-template #filters><div class="filters"><erp-option-select data-testid="active-filter" [label]="'common.active'|uiText" [value]="draftActive()" [options]="activeOptions()" (valueChange)="draftActive.set($event)" /><erp-option-select data-testid="id-filter" [label]="'general.id'|uiText" [value]="draftId()" [options]="idOptions()" (valueChange)="draftId.set($event)" /></div></ng-template>
 <router-outlet />
 <output data-testid="state" [attr.data-applied]="serialized()" [attr.data-requests]="requests()" [attr.data-page]="criteria.applied().pageIndex" [attr.data-size]="criteria.applied().pageSize" [attr.data-result]="result()" [attr.data-pending]="criteria.pending()" [attr.data-valid]="criteria.resolution().valid" [attr.data-scope]="scope()" [attr.data-kind]="source().kind" [attr.data-snapshot]="snapshot()">{{serialized()}}</output>
 </main>`,styles:`main{padding:24px;max-width:1450px;margin:auto;min-width:0}.tools,.filters{display:flex;flex-wrap:wrap;gap:8px;margin-block:16px}.filters{margin:0;padding:4px 8px;--option-label-background:var(--surface)}.filters erp-option-select{min-width:140px}.collection{height:650px;min-height:0}output{display:block;white-space:pre-wrap;overflow-wrap:anywhere;direction:ltr;color:var(--muted-foreground);font-size:12px;margin-block:16px}@media(max-width:600px){main{padding:12px}.collection{height:800px}.filters erp-option-select{flex:1;min-width:100px}}`})
export class CriteriaPreview{
 readonly runtime=inject(LocalizationRuntime);readonly theme=inject(ThemeService);readonly gate=inject(CriteriaPreviewGate);readonly palettes=themePaletteOrder;private readonly router=inject(Router);private readonly route=inject(ActivatedRoute);
 readonly criteria=createRouteCollectionCriteria(codec);readonly view=signal<'grid'|'cards'>('grid');readonly scope=signal('a');readonly allowed=signal(true);readonly requests=signal(0);readonly result=signal<CriteriaNavigationResult|'idle'>('idle');
 readonly draftSearch=signal('');readonly draftActive=signal('all');readonly draftId=signal('');
 readonly source=signal<CollectionSource<Sample>>({query:{scopeKey:'a',criteriaKey:codec.criteriaKey(codec.defaults),pageIndex:0,pageSize:10},kind:'loading'});
 readonly serialized=computed(()=>codec.encode(this.criteria.applied())!);readonly snapshot=computed(()=>JSON.stringify(this.source().result?.rows??[]));
 readonly editorOpen=toSignal(this.router.events.pipe(filter((event):event is NavigationEnd=>event instanceof NavigationEnd),map(event=>event.urlAfterRedirects.split('?')[0].includes('/editor/'))),{initialValue:this.route.snapshot.firstChild!==null});
 readonly id=(row:Sample)=>row.id;readonly name=(row:Sample)=>row.name;
 readonly columns=computed<readonly CollectionColumn<Sample>[]>(()=>[{key:'id',header:this.runtime.translate('general.id'),value:r=>r.id,sortField:'id',width:85},{key:'name',header:this.runtime.translate('general.nameEn'),value:r=>r.name,sortField:'name',width:220},{key:'active',header:this.runtime.translate('common.active'),value:r=>r.active===null?this.runtime.translate('pagination.unknownTotal'):this.runtime.translate(r.active?'common.active':'common.inactive')}]);
 readonly search=computed<CollectionSearch>(()=>({value:this.draftSearch(),placeholder:this.runtime.translate('search.searchText')}));
 readonly activeOptions=computed(()=>[{value:'all',label:this.runtime.translate('common.all')},{value:'true',label:this.runtime.translate('common.active')},{value:'false',label:this.runtime.translate('common.inactive')},{value:'null',label:this.runtime.translate('pagination.unknownTotal')}]);
 readonly idOptions=computed(()=>[{value:'',label:this.runtime.translate('common.all')},...fixtures.map(row=>({value:String(row.id),label:String(row.id)}))]);
 private generation=0;private timer:ReturnType<typeof setTimeout>|undefined;
 constructor(){
  void this.runtime.loadNamespace('core');
  const filterKey=computed(()=>codec.criteriaKey(this.criteria.applied()));
  effect(()=>{filterKey();untracked(()=>{const state=this.criteria.applied(),active=state.filters.find(f=>f.field==='active'),id=state.filters.find(f=>f.field==='id');this.draftSearch.set(state.search?.value??'');this.draftActive.set(active?String(active.value):'all');this.draftId.set(id?String(id.value):'');});});
  effect(()=>{const state=this.criteria.applied(),scope=this.scope(),allowed=this.allowed();untracked(()=>this.load(state,scope,allowed));});
  inject(DestroyRef).onDestroy(()=>{this.generation++;clearTimeout(this.timer);});
 }
 draft(change:CollectionSearchChange){if('value'in change)this.draftSearch.set(change.value);}
 async apply(){const filters:CriteriaFilter[]=[];const active=this.draftActive();if(active!=='all')filters.push({field:'active',operator:'equals',value:active==='null'?null:active==='true'});const id=this.draftId();if(id!=='')filters.push({field:'id',operator:'equals',value:Number(id)});this.result.set(await this.criteria.apply({search:this.draftSearch()===''?null:{field:'name',operator:'contains',value:this.draftSearch()},filters}));}
 async reset(){this.draftSearch.set('');this.draftActive.set('all');this.draftId.set('');this.result.set(await this.criteria.reset());}
 async page(value:CollectionPageRequest){this.result.set(await this.criteria.apply(value));}
 async sort(value:CollectionSort){this.result.set(await this.criteria.apply({sort:value}));}
 refresh(){this.load(this.criteria.applied(),this.scope(),this.allowed());}
 open(id:number){void this.router.navigate(['/dev/criteria/editor',id],{queryParamsHandling:'preserve',preserveFragment:true});}
 private load(state:CollectionCriteria,scope:string,allowed:boolean){
  const generation=++this.generation;clearTimeout(this.timer);const query={scopeKey:scope,criteriaKey:codec.criteriaKey(state),pageIndex:state.pageIndex,pageSize:state.pageSize};this.source.set({query,kind:allowed?'loading':'forbidden'});if(!allowed)return;this.requests.update(n=>n+1);
  this.timer=setTimeout(()=>{if(generation!==this.generation)return;const rows=fixtures.filter(row=>state.filters.every(f=>row[f.field as 'id'|'active']===f.value)&&(!state.search||(state.search.operator==='contains'?row.name.includes(state.search.value):row.name===state.search.value)));const sort=state.sort;if(sort)rows.sort((a,b)=>(sort.field==='id'?a.id-b.id:a.name<b.name?-1:a.name>b.name?1:0)*(sort.direction==='asc'?1:-1));const start=state.pageIndex*state.pageSize;this.source.set({query,kind:'ready',result:{query,rows:rows.slice(start,start+state.pageSize),total:rows.length,hasNextPage:start+state.pageSize<rows.length}});},120);
 }
}
@Component({imports:[ActionButton,PageHeader,StatusBadge,UiTextPipe],template:`<section data-testid="detail"><erp-page-header [title]="'actions.view'|uiText" /><erp-status-badge [label]="record" /><erp-button data-testid="return" [label]="'common.back'|uiText" (activated)="back()" /></section>`})
export class CriteriaPreviewEditor{
 private readonly router=inject(Router);readonly record=inject(ActivatedRoute).snapshot.paramMap.get('record')??'';
 back(){void this.router.navigate(['/dev/criteria'],{queryParamsHandling:'preserve',preserveFragment:true});}
}

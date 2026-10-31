import { Component,contentChild,inject,input,output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { Checkbox } from 'primeng/checkbox';
import { LocalizationRuntime,UiTextPipe } from '../../../platform/localization/public-api';
import { SurfaceCard } from '../layout/surface-card';
import { ScrollViewport } from '../layout/scroll-viewport';
import { CollectionFrame } from './collection-frame';
import { CollectionFeedback } from './collection-feedback';
import { CollectionCardTemplate,CollectionCardHeader,CollectionCardFooter,CollectionEmptyTemplate } from './collection-templates';
import { createCollectionController } from './collection-controller';
import type { CollectionRecordRequest } from './collection-record-feedback';
import { collectionKeyTarget } from './collection-keyboard';
import { attachCollectionFocus,collectionRowInteraction } from './collection-focus';
import { collectionPageSizes,type CollectionId,type CollectionPageRequest,type CollectionSearch,type CollectionSearchChange,type CollectionSource } from './collection.types';
@Component({selector:'erp-card-list',imports:[FormsModule,NgTemplateOutlet,Checkbox,SurfaceCard,ScrollViewport,CollectionFrame,CollectionFeedback,UiTextPipe],template:`
 <erp-collection-frame [controller]="controller" [label]="label()" [search]="search()" [searchMaxWidth]="searchMaxWidth()" [pageSizes]="pageSizes()" [recordNavigation]="recordNavigation()" [selectionEnabled]="selectionEnabled()" [toolbarVisible]="toolbarVisible()" [toolbarLayout]="toolbarLayout()" (searchChange)="searchChange.emit($event)">
  <div toolbarContent class="collection-actions"><ng-content select="[toolbarContent]" /></div><div toolbarFilters><ng-content select="[toolbarFilters]" /></div>
  <div collectionBody class="cards-body"><erp-scroll-viewport [label]="label()">
   @if(controller.view().kind==='ready'&&controller.view().rows.length){<div class="cards" [class.responsive]="layout()==='responsive'" role="list">
    @for(row of controller.view().rows;track controller.rowKey(row)){<article role="listitem" [attr.data-collection-row]="controller.rowKey(row)" [attr.tabindex]="controller.activeId()===rowId()(row)?0:-1" [class.edited-row]="controller.flashedId()===rowId()(row)" [class.active]="controller.activeId()===rowId()(row)" [class.selected]="controller.selectedIds().includes(rowId()(row))" (click)="clickRow(row,$event)" (keydown)="keyRow(row,$event)" (focus)="controller.activate(rowId()(row))">
     <erp-surface-card [title]="rowLabel()(row)" compact fill [entity]="appearance()==='entity'" [headerTemplate]="header()?.template??null" [footerTemplate]="footer()?.template??null" [templateContext]="{$implicit:row}">
      @if(selectionEnabled()){<p-checkbox [binary]="true" [ngModelOptions]="{standalone:true}" [ngModel]="controller.selectedIds().includes(rowId()(row))" [disabled]="!selectable()(row)" [ariaLabel]="'collections.selectRecord'|uiText:'core':{record:rowLabel()(row)}" (ngModelChange)="controller.toggle(rowId()(row),$event===true)" />}
      @if(card();as template){<ng-container *ngTemplateOutlet="template.template;context:{$implicit:row}" />}
     </erp-surface-card>
    </article>}
   </div>}@else{<erp-collection-feedback [kind]="controller.view().kind" [emptyTemplate]="empty()?.template" (retry)="retry.emit()" />}
  </erp-scroll-viewport></div>
 </erp-collection-frame>`,styleUrls:['./collection-slots.scss','./card-list.scss','./collection-row-flash.scss'],styles:`
 :host{display:flex;flex-direction:column;height:100%;min-height:0;min-width:0}.cards-body{flex:1;min-height:0;min-width:0}.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:16px;padding:16px}article{position:relative;border:2px solid transparent;border-radius:14px;min-width:0}article.active{border-color:var(--primary)}article.selected{background:color-mix(in srgb,var(--primary) 13%,var(--surface))}article:focus-visible{outline:2px solid var(--ring);outline-offset:2px}p-checkbox{float:inline-end;margin-inline-start:8px}@media(max-width:599px){.cards{padding:8px;gap:12px}}
 `})
export class CardList<T>{
 readonly toolbarVisible=input(true);readonly toolbarLayout=input<'responsive'|'single-row'>('responsive');
 readonly searchMaxWidth=input<number|null>(null);
 readonly recordNavigation=input(false);readonly recordRequest=input<CollectionRecordRequest|null>(null);
 readonly layout=input<'auto'|'responsive'>('auto');readonly appearance=input<'compact'|'entity'>('compact');
 private readonly locale=inject(LocalizationRuntime);
 readonly source=input.required<CollectionSource<T>>();readonly label=input.required<string>();readonly rowId=input.required<(row:T)=>CollectionId>();readonly rowLabel=input.required<(row:T)=>string>();readonly selectable=input<(row:T)=>boolean>(()=>true);readonly selectionEnabled=input(false);readonly search=input<CollectionSearch>();readonly pageSizes=input<readonly number[]>(collectionPageSizes);
 readonly pageChange=output<CollectionPageRequest>();readonly activeChange=output<CollectionId|null>();readonly selectionChange=output<readonly CollectionId[]>();readonly searchChange=output<CollectionSearchChange>();readonly retry=output<void>();readonly rowActivated=output<T>();
 readonly controller=createCollectionController(this.source,this.rowId,this.selectable,{page:request=>this.pageChange.emit(request),active:id=>this.activeChange.emit(id),selected:ids=>this.selectionChange.emit(ids)},undefined,this.recordRequest);
 readonly card=contentChild(CollectionCardTemplate<T>);readonly header=contentChild(CollectionCardHeader<T>);readonly footer=contentChild(CollectionCardFooter<T>);readonly empty=contentChild(CollectionEmptyTemplate);
 constructor(){attachCollectionFocus(this.controller);}
 clickRow(row:T,event:Event){if(!collectionRowInteraction(event))this.controller.activate(this.rowId()(row),true);}
 keyRow(row:T,event:KeyboardEvent){
  if(event.defaultPrevented||collectionRowInteraction(event)||this.controller.view().kind!=='ready'||!this.controller.view().rows.includes(row))return;
  if(event.key==='Enter'&&!event.ctrlKey&&!event.altKey&&!event.metaKey){event.preventDefault();this.rowActivated.emit(row);return;}
  if(event.key===' '&&this.selectionEnabled()){event.preventDefault();const id=this.rowId()(row);this.controller.toggle(id,!this.controller.selectedIds().includes(id));return;}
  const view=this.controller.view(),target=collectionKeyTarget(event,{...view.query,rowIndex:view.rows.indexOf(row),rowCount:view.rows.length,total:view.total,hasNextPage:view.hasNextPage,rtl:this.locale.direction()==='rtl'});
  if(target!==null){event.preventDefault();if(typeof target==='number')this.controller.navigateIndex(target);else this.controller.navigate(target);}
 }
}

import { Component,computed,inject,input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Paginator } from 'primeng/paginator';
import { LocalizationRuntime,UiTextPipe } from '../../../platform/localization/public-api';
import { GridLocale } from '../../../../theme/grid-public-api';
import { ActionButton } from '../buttons/public-api';
import { OptionSelect } from '../controls/option-select';
import type { CollectionController } from './collection-controller';
import { collectionPageSizes,type RecordAction } from './collection.types';
@Component({selector:'erp-collection-footer',imports:[NgTemplateOutlet,Paginator,ActionButton,OptionSelect,UiTextPipe],template:`
 <footer [class.with-record-navigation]="recordNavigation()">
  <ng-template #recordControls>
  <div class="record-controls" role="group" [attr.aria-label]="'collections.recordNavigation'|uiText">
   @for(action of recordActions;track action.value){<erp-button appearance="icon" variant="text" [label]="action.label|uiText" [disabled]="!controller().canNavigate(action.value)" (activated)="controller().navigate(action.value)"><span buttonIcon aria-hidden="true" [class.rtl]="locale.direction()==='rtl'">{{action.icon}}</span></erp-button>}
   <span class="record-count" aria-live="polite">{{number(controller().activeIndex()<0?0:controller().activeIndex()+1)}} / {{total()}}</span>
  </div>
  </ng-template>
  <ng-template #recordBalance><span aria-hidden="true"></span></ng-template>
  <ng-template #recordPageSize><div class="size-settings">@if(controller().view().total!==null){<span class="page-count">{{'pagination.pages'|uiText}}: {{pageCount()}}</span>}<erp-option-select labelVisibility="sr-only" valueAlign="center" [title]="'pagination.rowsPerPage'|uiText" [controlHeight]="32" [label]="'pagination.rowsPerPage'|uiText" [value]="''+controller().view().query.pageSize" [options]="sizeOptions()" [disabled]="blocked()" (valueChange)="resize(+$event)" /></div></ng-template>
  <div class="page-controls">
   @if(controller().view().total!==null){
    <div class="native-page-controls" [attr.inert]="blocked()?'':null" [class.blocked]="blocked()"><p-paginator [templateLeft]="recordNavigation()?recordBalance:undefined" [templateRight]="recordNavigation()?recordPageSize:undefined" [first]="recordNavigation()?Math.max(0,controller().activeIndex()):controller().view().query.pageIndex*controller().view().query.pageSize" [rows]="recordNavigation()?1:controller().view().query.pageSize" [totalRecords]="controller().view().total??0" [showPageLinks]="!recordNavigation()" [pageLinkSize]="3" [rowsPerPageOptions]="recordNavigation()?undefined:nativePageSizes()" [showCurrentPageReport]="true" [currentPageReportTemplate]="pageReport()" appendTo="body" [locale]="locale.language()" [pt]="paginatorLabels()" [dt]="tokens" (onPageChange)="paginate($event)" /></div>
   }@else{
    @if(recordNavigation()){<ng-container [ngTemplateOutlet]="recordControls" />}@else{
    <span class="page-summary">{{'pagination.page'|uiText}} {{number(controller().view().query.pageIndex+1)}} {{'pagination.of'|uiText}} {{pageCount()}}</span>
    @for(action of pageActions;track action.value){<erp-button appearance="icon" variant="text" [label]="action.label|uiText" [disabled]="blocked()||(action.value==='next'?!controller().view().hasNextPage:controller().view().query.pageIndex===0)" (activated)="unknownPage(action.value)"><span buttonIcon aria-hidden="true" [class.rtl]="locale.direction()==='rtl'">{{action.icon}}</span></erp-button>}
    }
    <ng-container [ngTemplateOutlet]="recordPageSize" />
   }
  </div>
 </footer>`,styles:`
 :host{display:block;flex-shrink:0}footer{min-height:52px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;border-top:1px solid var(--border);background:var(--surface);font-size:14px;--option-label-background:var(--surface)}
 .record-controls,.page-controls{display:flex;align-items:center;gap:4px;min-width:0}.record-controls{justify-content:center}.record-count{font-variant-numeric:tabular-nums;direction:ltr;white-space:nowrap;min-width:75px;text-align:center;background:var(--muted);border-radius:6px;padding:6px 8px;order:2}.record-controls erp-button:nth-of-type(n+3){order:3}.rtl{display:inline-block;transform:scaleX(-1)}
 erp-button{--action-min-height:32px;--action-font-size:22px}.page-summary{color:var(--muted-foreground);white-space:nowrap;font-variant-numeric:tabular-nums}erp-option-select{min-inline-size:80px;inline-size:80px;max-inline-size:80px}.blocked{opacity:.55;pointer-events:none}
 .page-controls{flex:1;justify-content:center;max-width:100%}.native-page-controls{flex:1;inline-size:100%;max-inline-size:100%;min-inline-size:0}p-paginator{max-inline-size:100%}
 .size-settings{display:flex;align-items:center;justify-content:flex-end;gap:12px;white-space:nowrap}.page-count{color:var(--muted-foreground);font-size:12px;font-variant-numeric:tabular-nums}:host ::ng-deep .with-record-navigation .collection-nav-space,:host ::ng-deep .with-record-navigation .collection-size-slot{flex:1 1 0px;min-inline-size:0;margin-inline:0}
 @media(max-width:799px){:host ::ng-deep .with-record-navigation .collection-nav-space{display:none}:host ::ng-deep .with-record-navigation .collection-size-slot{flex-basis:100%;margin-block-start:8px}footer{flex-wrap:wrap;justify-content:center}.page-controls{flex:1 1 100%;flex-wrap:wrap;justify-content:center;gap:6px}.native-page-controls{inline-size:100%}}@media(max-width:599px){footer{padding:10px 0;gap:8px;font-size:12px}.page-controls{width:100%}:host:not(:has(.with-record-navigation)) ::ng-deep .collection-page-report{flex-basis:100%;text-align:center}}
 `})
export class CollectionFooter<T>{
 private readonly nativeLocale=inject(GridLocale);
 readonly recordNavigation=input(false);readonly Math=Math;
 readonly controller=input.required<CollectionController<T>>();readonly pageSizes=input<readonly number[]>(collectionPageSizes);readonly locale=inject(LocalizationRuntime);
 readonly recordActions:readonly{value:RecordAction;label:string;icon:string}[]=[{value:'first',label:'pagination.goToFirstRecord',icon:'«'},{value:'previous',label:'pagination.goToPreviousRecord',icon:'‹'},{value:'next',label:'pagination.goToNextRecord',icon:'›'},{value:'last',label:'pagination.goToLastRecord',icon:'»'}];
 readonly pageActions=[{value:'first',label:'pagination.first',icon:'«'},{value:'previous',label:'pagination.previous',icon:'‹'},{value:'next',label:'pagination.next',icon:'›'}] as const;
 readonly tokens={root:{padding:'0px',background:'transparent',gap:'2px'},navButton:{width:'32px',height:'32px',color:'var(--muted-foreground)',hoverBackground:'var(--accent)',hoverColor:'var(--foreground)'}};
 readonly blocked=computed(()=>['loading','forbidden'].includes(this.controller().view().kind));
 readonly total=computed(()=>this.controller().view().total===null?this.locale.translate('pagination.unknownTotal'):this.number(this.controller().view().total!));
 readonly pageCount=computed(()=>{const view=this.controller().view();return view.total===null?this.locale.translate('pagination.unknownTotal'):this.number(Math.max(1,Math.ceil(view.total/view.query.pageSize)));});
 readonly sizeOptions=computed(()=>this.pageSizes().map(value=>({value:String(value),label:this.number(value)})));
 readonly nativePageSizes=computed(()=>[...this.pageSizes()]);
 readonly pageReport=computed(()=>this.recordNavigation()?'{currentPage} / {totalRecords}':this.locale.translate('pagination.page')+' {currentPage} '+this.locale.translate('pagination.of')+' {totalPages}');
 readonly paginatorLabels=computed(()=>{
  const records=this.recordNavigation(),view=this.controller().view();
  const action=(record:RecordAction,page:string,order:number)=>({'aria-label':this.locale.translate(records?'pagination.goTo'+record[0].toUpperCase()+record.slice(1)+'Record':'pagination.'+page),...(records?{style:{order:String(order)}}:{})});
  return{root:{'aria-label':this.locale.translate(records?'collections.recordNavigation':'pagination.goToPage')},contentStart:{class:'collection-nav-space',style:{order:'-1'}},
   current:{class:'collection-page-report',...(records?{style:{order:'2',direction:'ltr',padding:'6px 10px',margin:'0 4px',borderRadius:'6px',background:'var(--muted)',minWidth:'60px',textAlign:'center',fontVariantNumeric:'tabular-nums',fontWeight:'600'}}:{})},
   first:{...action('first','first',0),disabled:this.blocked()||(records?!this.controller().canNavigate('first'):view.query.pageIndex===0)},
   prev:action('previous','previous',1),next:action('next','next',3),last:action('last','last',4),
   contentEnd:{class:'collection-size-slot',style:{order:'5'}},
   pcRowPerPageDropdown:{root:{style:{width:'80px',height:'36px',fontSize:'14px'}},label:{style:{padding:'6px 10px'}},dropdown:{style:{width:'28px'}}}};
 });
 number(value:number){return new Intl.NumberFormat(this.locale.language()).format(value);}
 paginate(value:unknown){if(this.blocked()||typeof value!=='object'||value===null||!('page'in value)||!('rows'in value)||typeof value.page!=='number'||typeof value.rows!=='number')return;if(this.recordNavigation()){if(value.rows===1&&Number.isSafeInteger(value.page))this.controller().navigateIndex(value.page);return;}if(!this.pageSizes().includes(value.rows))return;this.controller().page({pageIndex:value.rows===this.controller().view().query.pageSize?value.page:0,pageSize:value.rows});}
 resize(size:number){if(this.pageSizes().includes(size))this.controller().page({pageIndex:0,pageSize:size});}
 unknownPage(action:'first'|'previous'|'next'){const view=this.controller().view();this.controller().page({pageIndex:action==='first'?0:view.query.pageIndex+(action==='next'?1:-1),pageSize:view.query.pageSize});}
}

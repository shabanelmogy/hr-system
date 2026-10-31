import { Component,computed,effect,inject,input,output,signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl,FormsModule,ReactiveFormsModule,Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Checkbox } from 'primeng/checkbox';
import { TabsModule } from 'primeng/tabs';
import { SelectButton } from 'primeng/selectbutton';
import { LocalizationRuntime,UiTextPipe } from '../../../platform/localization/public-api';
import { ActionButton } from '../buttons/public-api';
import { AppIcon } from '../icons/app-icon';
import { TextField } from '../forms/public-api';
import { OptionSelect } from '../controls/option-select';
import { DialogPanel } from '../dialogs/dialog-panel';
import { CollectionFooter } from './collection-footer';
import type { CollectionController } from './collection-controller';
import { collectionPageSizes,type CollectionColumn,type CollectionDensity,type CollectionSearch,type CollectionSearchChange,type CollectionToolbarLayout } from './collection.types';
@Component({selector:'erp-collection-frame',imports:[NgTemplateOutlet,ReactiveFormsModule,FormsModule,Checkbox,TabsModule,SelectButton,ActionButton,AppIcon,TextField,OptionSelect,DialogPanel,CollectionFooter,UiTextPipe],template:`
 <ng-template #ownerFilters><div class="filter-region"><ng-content select="[toolbarFilters]" /></div></ng-template>
 <section class="collection-shell" [class.reference-shell]="appearance()==='reference'" [class.plain-shell]="appearance()==='plain'" [class.single-row-toolbar]="toolbarLayout()==='single-row'" [attr.aria-label]="label()">
  @if(toolbarVisible()){
  <header class="collection-toolbar erp-native-scrollbar">
   @if(search();as criteria){<div class="search-controls">
    @if(criteria.field;as field){<erp-option-select class="search-field" [controlHeight]="appearance()==='reference'?36:40" [label]="field.label" [value]="field.value" [options]="field.options" (valueChange)="searchChange.emit({field:$event})" />}
    @if(criteria.operator;as operator){<erp-option-select class="search-operator" [controlHeight]="appearance()==='reference'?36:40" [label]="operator.label" [value]="operator.value" [options]="operator.options" (valueChange)="searchChange.emit({operator:$event})" />}
    <erp-text-field labelVisibility="sr-only" [style.max-width.px]="searchMaxWidth()" [label]="'general.search'|uiText" [placeholder]="criteria.placeholder" [maxLength]="searchLimit()" [messages]="searchMessages()" [formControl]="searchControl" [clearVisibility]="appearance()==='reference'?'always':'value'">@if(appearance()==='reference'){<erp-icon fieldIcon name="search" />}</erp-text-field>
   </div>}
   @if(toolbarLayout()==='single-row'){<ng-container [ngTemplateOutlet]="ownerFilters" />}
   <div class="toolbar-content"><ng-content select="[toolbarContent]" /></div>
   @if(columns().length){<erp-button appearance="quiet" variant="text" [label]="'actions.gridOptions'|uiText" [expanded]="optionsOpen()" hasPopup="dialog" (activated)="optionsOpen.set(true)"><erp-icon buttonIcon name="settings" /></erp-button>}
  </header>
  @if(toolbarLayout()==='responsive'){<ng-container [ngTemplateOutlet]="ownerFilters" />}
  }
  @if(selectionEnabled()){
   <div class="selection-bar">@if(pageSelection()){<p-checkbox [binary]="true" [ngModelOptions]="{standalone:true}" [ngModel]="controller().allSelected()" [indeterminate]="controller().partlySelected()" [ariaLabel]="'collections.selectPage'|uiText" [disabled]="controller().view().kind!=='ready'||!controller().eligibleIds().length" (ngModelChange)="controller().selectPage($event===true)" />}
    <span aria-live="polite">{{'collections.selected'|uiText:'core':{count:controller().selectedIds().length} }}</span>
    <erp-button [label]="'general.clear'|uiText" variant="text" [disabled]="!controller().selectedIds().length" (activated)="controller().clearSelection()" />
   </div>
  }
  <ng-content select="[collectionBody]" />
  @if(showFooter()){<erp-collection-footer [controller]="controller()" [pageSizes]="pageSizes()" [recordNavigation]="recordNavigation()" />}
 </section>
 <erp-dialog-panel [open]="optionsOpen()" [title]="'actions.gridOptions'|uiText" [description]="'collections.optionsDescription'|uiText" [closeLabel]="'actions.close'|uiText" icon="settings" (closeRequested)="optionsOpen.set(false)">
  <div class="grid-options">
   <p-tabs value="display">
    <p-tablist><p-tab value="display">{{'collections.displayOptions'|uiText}}</p-tab><p-tab value="columns">{{'collections.columns'|uiText}} <span class="column-count">{{visibleColumns().length}} / {{columns().length}}</span></p-tab></p-tablist>
    <p-tabpanels>
     <p-tabpanel value="display">
      <section class="option-section"><h3 [id]="id+'-density'">{{'collections.density'|uiText}}</h3><p>{{'collections.densityDescription'|uiText}}</p>
       <p-selectbutton [options]="densities()" [ngModel]="density()" [ngModelOptions]="{standalone:true}" optionLabel="label" optionValue="value" [allowEmpty]="false" [fluid]="true" [attr.aria-labelledby]="id+'-density'" (ngModelChange)="changeDensity($event)" />
       <div class="density-preview" [attr.data-density]="density()" aria-hidden="true"><div><i></i><i></i><i></i></div><div><i></i><i></i><i></i></div><div><i></i><i></i><i></i></div></div>
      </section>
      <div class="owner-options"><ng-content select="[gridOptions]" /></div>
     </p-tabpanel>
     <p-tabpanel value="columns">
      <p class="options-hint">{{'collections.columnsDescription'|uiText}}</p>
      <erp-text-field labelVisibility="sr-only" [label]="'collections.searchColumns'|uiText" [placeholder]="'collections.searchColumns'|uiText" [ngModel]="columnSearch()" [ngModelOptions]="{standalone:true}" (ngModelChange)="columnSearch.set($event)"><erp-icon fieldIcon name="search" /></erp-text-field>
      <div class="column-list erp-native-scrollbar">
       @for(column of optionColumns();track column.key){<div class="column-option" [class.column-hidden]="!visibleColumns().includes(column.key)" [attr.data-option-column]="column.key">
        <div class="column-visibility"><p-checkbox [binary]="true" [ngModelOptions]="{standalone:true}" [ngModel]="visibleColumns().includes(column.key)" [inputId]="id+'-'+column.key" [disabled]="column.hideable===false||(visibleColumns().length===1&&visibleColumns().includes(column.key))" (ngModelChange)="toggleColumn(column.key,$event)" /><label [for]="id+'-'+column.key">{{column.header}}</label></div>
        @if(columnTools()){
         <div class="column-controls">
          <div class="column-order"><erp-button appearance="icon" variant="text" [disabled]="columns()[0]?.key===column.key" [label]="('collections.movePrevious'|uiText)+' '+column.header" (activated)="columnMove.emit({key:column.key,direction:-1})"><erp-icon buttonIcon name="arrowUp" /></erp-button>
          <erp-button appearance="icon" variant="text" [disabled]="columns()[columns().length-1]?.key===column.key" [label]="('collections.moveNext'|uiText)+' '+column.header" (activated)="columnMove.emit({key:column.key,direction:1})"><erp-icon buttonIcon name="arrowDown" /></erp-button></div>
          <erp-option-select overlayTarget="self" [controlHeight]="36" [label]="'collections.columnPosition'|uiText" [value]="pinnedColumns()[column.key]??'none'" [options]="pinOptions()" (valueChange)="pin(column.key,$event)" />
         </div>
        }
       </div>}@empty{<p class="options-hint">{{'common.noOptionsFound'|uiText}}</p>}
      </div>
     </p-tabpanel>
    </p-tabpanels>
   </p-tabs>
  </div>
  <div dialogActions class="options-actions"><erp-button [label]="'collections.resetDisplay'|uiText" variant="text" (activated)="resetOptions()" /><erp-button [label]="'actions.close'|uiText" (activated)="optionsOpen.set(false)" /></div>
 </erp-dialog-panel>`,styleUrls:['./collection-frame.scss','./collection-options.scss'],styles:`
 :host{display:flex;flex-direction:column;min-width:0;min-height:0;height:100%}.collection-shell{display:flex;flex-direction:column;height:100%;min-width:0;min-height:0;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--surface);color:var(--foreground)}
 .collection-toolbar{display:flex;align-items:center;gap:8px;padding:8px;flex-wrap:wrap;flex-shrink:0;--touch-target:36px;--option-label-background:var(--surface)}.search-controls{display:flex;align-items:center;gap:8px;flex:1;min-width:160px;flex-wrap:wrap}.search-controls erp-option-select{flex:0 1 155px}.search-controls erp-text-field{flex:1;min-width:160px}.toolbar-content{display:flex;align-items:center;gap:4px;margin-inline-start:auto}.filter-region:empty,.filter-region:has(>[toolbarFilters]:empty){display:none}.filter-region{padding:0 8px 8px;flex-shrink:0}
 .selection-bar{display:flex;align-items:center;gap:8px;padding:4px 12px;border-block:1px solid var(--border);font-size:12px;flex-shrink:0}.selection-bar erp-button{margin-inline-start:auto;--action-min-height:30px}
 @media(max-width:599px){.collection-toolbar{padding:8px 4px;gap:8px}.search-controls{flex-basis:100%}.search-controls erp-option-select{flex:1;min-width:0}.search-controls erp-text-field{flex-basis:100%}.toolbar-content{margin-inline-start:0}}
 `})
export class CollectionFrame<T>{
 private static sequence=0;readonly id='erp-grid-options-'+ ++CollectionFrame.sequence;
 readonly label=input.required<string>();readonly controller=input.required<CollectionController<T>>();readonly search=input<CollectionSearch>();readonly pageSizes=input<readonly number[]>(collectionPageSizes);
 readonly selectionEnabled=input(false);readonly columns=input<readonly CollectionColumn<T>[]>([]);readonly visibleColumns=input<readonly string[]>([]);readonly density=input<CollectionDensity>('standard');
 readonly toolbarVisible=input(true);readonly appearance=input<'standard'|'reference'|'plain'>('standard');
 readonly toolbarLayout=input<CollectionToolbarLayout>('responsive');
 readonly recordNavigation=input(false);readonly showFooter=input(true);readonly searchMaxWidth=input<number|null>(null);
 readonly optionsOpen=signal(false);readonly columnSearch=signal('');
 readonly optionColumns=computed(()=>{const search=this.columnSearch().trim().normalize('NFKC').toLocaleLowerCase(this.locale.language());return this.columns().filter(column=>column.header.normalize('NFKC').toLocaleLowerCase(this.locale.language()).includes(search));});
 readonly pageSelection=input(true);
 readonly columnTools=input(false);readonly pinnedColumns=input<Readonly<Record<string,'start'|'end'>>>({});readonly columnMove=output<{readonly key:string;readonly direction:-1|1}>();readonly columnPin=output<{readonly key:string;readonly side:'start'|'end'|null}>();
 readonly pinOptions=computed(()=>[{value:'none',label:this.locale.translate('collections.unpin')},{value:'start',label:this.locale.translate('collections.pinStart')},{value:'end',label:this.locale.translate('collections.pinEnd')}]);
 readonly searchChange=output<CollectionSearchChange>();readonly columnsChange=output<readonly string[]>();readonly densityChange=output<CollectionDensity>();readonly displayReset=output<void>();
 readonly searchControl=new FormControl('',{nonNullable:true});private readonly locale=inject(LocalizationRuntime);
 readonly densities=computed(()=>['compact','standard','comfortable'].map(value=>({value,label:this.locale.translate('collections.'+value)})));
 private lastOwnerValue:string|null=null;private synchronizing=false;
 readonly searchLimit=computed(()=>{const value=this.search()?.maxLength;return typeof value==='number'&&Number.isSafeInteger(value)&&value>0?value:null;});
 readonly searchMessages=computed(()=>({maxlength:this.locale.translate('validation.maxLength','core',{count:this.searchLimit()??undefined})}));
 constructor(){
  effect(()=>{const value=this.search()?.value??'',limit=this.searchLimit();this.synchronizing=true;
   try{if(value!==this.lastOwnerValue){this.lastOwnerValue=value;this.searchControl.setValue(value,{emitEvent:false});}
    this.searchControl.setValidators(limit===null?null:Validators.maxLength(limit));this.searchControl.updateValueAndValidity();
   }finally{this.synchronizing=false;}
  });
  this.searchControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(value=>{if(!this.synchronizing&&this.searchControl.valid)this.searchChange.emit({value});});
 }
 changeDensity(value:string){if(value==='compact'||value==='standard'||value==='comfortable')this.densityChange.emit(value);}
 resetOptions(){this.columnSearch.set('');this.displayReset.emit();}
 pin(key:string,value:string){if(this.columnTools()&&this.columns().some(column=>column.key===key)&&(value==='start'||value==='end'||value==='none'))this.columnPin.emit({key,side:value==='none'?null:value});}
 toggleColumn(key:string,checked:unknown){const column=this.columns().find(c=>c.key===key);if(!column||column.hideable===false||typeof checked!=='boolean')return;const values=new Set(this.visibleColumns());if(checked)values.add(key);else if(values.size>1)values.delete(key);this.columnsChange.emit([...values]);}
}

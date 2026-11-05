import { Component,computed,effect,inject,input,output,signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl,FormsModule,ReactiveFormsModule,Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Checkbox } from 'primeng/checkbox';
import { UI_LOCALIZATION,UiTextPipe } from '../../localization/public-api';
import { ActionButton } from '../buttons/public-api';
import { AppIcon } from '../icons/app-icon';
import { TextField } from '../forms/public-api';
import { OptionSelect } from '../controls/option-select';
import { CollectionOptionsDialog } from './collection-options-dialog';
import { CollectionFooter } from './collection-footer';
import type { CollectionController } from './collection-controller';
import { collectionPageSizes,type CollectionColumn,type CollectionDensity,type CollectionSearch,type CollectionSearchChange,type CollectionToolbarLayout } from './collection.types';
@Component({selector:'erp-collection-frame',imports:[NgTemplateOutlet,ReactiveFormsModule,FormsModule,Checkbox,ActionButton,AppIcon,TextField,OptionSelect,CollectionOptionsDialog,CollectionFooter,UiTextPipe],templateUrl:'./collection-frame.html',styleUrl:'./collection-frame.scss'})
export class CollectionFrame<T>{
 readonly label=input.required<string>();readonly controller=input.required<CollectionController<T>>();readonly search=input<CollectionSearch>();readonly pageSizes=input<readonly number[]>(collectionPageSizes);
 readonly selectionEnabled=input(false);readonly columns=input<readonly CollectionColumn<T>[]>([]);readonly visibleColumns=input<readonly string[]>([]);readonly density=input<CollectionDensity>('standard');
 readonly toolbarVisible=input(true);readonly appearance=input<'standard'|'reference'|'plain'>('standard');
 readonly toolbarLayout=input<CollectionToolbarLayout>('responsive');
 readonly recordNavigation=input(false);readonly showFooter=input(true);readonly searchMaxWidth=input<number|null>(null);
 readonly optionsOpen=signal(false);
 readonly pageSelection=input(true);
 readonly columnTools=input(false);readonly pinnedColumns=input<Readonly<Record<string,'start'|'end'>>>({});readonly columnMove=output<{readonly key:string;readonly direction:-1|1}>();readonly columnPin=output<{readonly key:string;readonly side:'start'|'end'|null}>();
 readonly searchChange=output<CollectionSearchChange>();readonly columnsChange=output<readonly string[]>();readonly densityChange=output<CollectionDensity>();readonly displayReset=output<void>();
 readonly searchControl=new FormControl('',{nonNullable:true});private readonly locale=inject(UI_LOCALIZATION);
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
}

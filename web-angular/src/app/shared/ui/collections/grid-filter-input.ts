import { Component,computed,effect,inject,input,output,signal } from '@angular/core';
import { FormControl,ReactiveFormsModule,Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TextField,NumericField,DateField } from '../forms/public-api';
import { OptionSelect } from '../controls/option-select';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import { filterValueValid,type GridColumnFilter } from './grid-filter.types';

/** Native ColumnFilter owns its menu/rules; our fields own value validation and accessibility. */
@Component({selector:'erp-grid-filter-input',imports:[ReactiveFormsModule,TextField,NumericField,DateField,OptionSelect],template:`
 @switch(definition().type){
  @case('number'){<erp-numeric-field labelVisibility="sr-only" [label]="label()" [formControl]="text" [mode]="numericOptions().mode" [min]="numericOptions().min" [max]="numericOptions().max" [maxFractionDigits]="numericOptions().maxFractionDigits" [showClear]="true" />}
  @case('date'){<erp-date-field [label]="label()" [formControl]="text" />}
  @case('boolean'){<erp-option-select [label]="label()" [value]="booleanChoice()" [options]="booleanOptions()" [controlHeight]="36" overlayTarget="self" (valueChange)="chooseBoolean($event)" />}
  @default{<erp-text-field labelVisibility="sr-only" [label]="label()" [formControl]="text" [maxLength]="definition().maxLength??200" />}
 }`,styles:':host{display:block;min-width:0}erp-text-field,erp-numeric-field,erp-date-field{--touch-target:36px}'})
export class GridFilterInput {
 readonly definition=input.required<GridColumnFilter>();readonly label=input.required<string>();readonly value=input<unknown>(null);readonly changed=output<unknown>();
 readonly text=new FormControl('',{nonNullable:true});readonly booleanChoice=signal('all');private synchronizing=false;
 private readonly locale=inject(LocalizationRuntime);
 readonly booleanOptions=computed(()=>[{value:'all',label:this.locale.translate('common.all')},{value:'true',label:this.locale.translate('collections.trueValue')},{value:'false',label:this.locale.translate('collections.falseValue')}]);
 readonly numericOptions=computed(()=>({mode:this.definition().numberMode??'decimal',min:this.definition().minimum===undefined?null:String(this.definition().minimum),max:this.definition().maximum===undefined?null:String(this.definition().maximum),maxIntegerDigits:null,maxFractionDigits:this.definition().numberMode==='integer'?0:null}));
 constructor(){
  effect(()=>{const definition=this.definition(),value=this.value();this.synchronizing=true;
   try{this.text.setValidators(definition.type==='text'?Validators.maxLength(definition.maxLength??200):null);
    const day=value instanceof Date&&Number.isFinite(value.getTime())?[String(value.getFullYear()).padStart(4,'0'),String(value.getMonth()+1).padStart(2,'0'),String(value.getDate()).padStart(2,'0')].join('-'):null;
    this.text.setValue(day??(typeof value==='string'||typeof value==='number'?String(value):''));this.booleanChoice.set(value===true?'true':value===false?'false':'all');
   }finally{this.synchronizing=false;}
  });
  this.text.valueChanges.pipe(takeUntilDestroyed()).subscribe(value=>{
   if(this.synchronizing)return;const definition=this.definition();
   if(!value){this.changed.emit(null);return;}
   const typed=definition.type==='number'?Number(value):value;
   if(this.text.valid&&filterValueValid(typed,definition))this.changed.emit(definition.type==='date'?new Date(value+'T12:00:00'):typed);
   else this.changed.emit(value); // Rejected as a whole on Apply; never retain an older valid criterion silently.
  });
 }
 chooseBoolean(value:string){if(value!=='true'&&value!=='false'&&value!=='all')return;this.booleanChoice.set(value);this.changed.emit(value==='all'?null:value==='true');}
}

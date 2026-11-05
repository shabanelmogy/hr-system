import { Component,effect,forwardRef,input,untracked,type OnDestroy } from '@angular/core';
import { AbstractControl,type ValidatorFn } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ButtonDirective } from 'primeng/button';
import { Times } from '@primeicons/angular/times';
import { UiTextPipe } from '../../../localization/public-api';
import { FormFieldControl } from '../form-field-control';
import { TextField } from './text-field';
import { CharacterCountBadge } from './character-count-badge';
import { normalizeNumericText,numericTextCapacity,numericTextErrors,type NumericOptions } from './numeric-text';

/** Uses TextField's exact template and lifecycle; owns only numeric edit semantics. */
@Component({selector:'erp-numeric-field',imports:[InputText,Textarea,ButtonDirective,UiTextPipe,Times,CharacterCountBadge],providers:[{provide:FormFieldControl,useExisting:forwardRef(()=>NumericField)}],templateUrl:'./text-field.html',styleUrl:'./text-field.scss',host:{'[class.floating]':"appearance()==='floating'"}})
export class NumericField extends TextField implements OnDestroy{
  readonly mode=input<'decimal'|'integer'>('decimal');readonly min=input<string|null|undefined>(null);readonly max=input<string|null|undefined>(null);
 readonly maxIntegerDigits=input<number|null>(null);readonly maxFractionDigits=input<number|null>(null);
 private owner:AbstractControl|null=null;
 private readonly validator:ValidatorFn=control=>numericTextErrors(control.value,this.options());
 constructor(){super();effect(()=>{this.options();untracked(()=>{if(this.owner)this.revalidate(this.owner);});});}
  private options():NumericOptions{return{mode:this.mode(),min:this.min()??null,max:this.max()??null,maxIntegerDigits:this.maxIntegerDigits(),maxFractionDigits:this.maxFractionDigits()};}
 override keyboardMode(){return this.mode()==='integer'?'numeric':'decimal';}
 override direction(){return'ltr';}
 override isMultiline(){return false;}
 override ngDoCheck(){super.ngDoCheck();const control=this.legacyControl();if(control===this.owner)return;this.detach();this.owner=control;if(control){control.addValidators(this.validator);this.revalidate(control);}}
 override onInput(event:Event){
  if(this.isDisabled()||this.isReadOnly())return;
  if(!this.composing&&event.target instanceof HTMLInputElement)event.target.value=normalizeNumericText(event.target.value);
  super.onInput(event);
 }
 override clear(){if(!this.isDisabled()&&!this.isReadOnly())super.clear();}
 override error():string|null{
   const error=super.error(),control=this.legacyControl();if(!error||control?.errors?.['server']||this.errors().some(error=>error.kind==='server'))return error;
   const key=control?Object.keys(control.errors??{})[0]:this.errors()[0]?.kind;if(!key||this.messages()[key])return error;
  const captions:Record<string,string>={numericText:'invalid',numericInteger:'integer',numericPrecision:'precision',numericScale:'scale',numericRange:'range',numericConfig:'configuration',numericCapacity:'capacity'};
  const detail = control?.errors?.[key] ?? this.errors().find(error => error.kind === key);
  return captions[key]?this.runtime.translate(`numericField.${captions[key]}`,'core',{digits:detail?.digits??(key==='numericScale'?this.maxFractionDigits():this.maxIntegerDigits()),min:detail?.min??this.min()??'−∞',max:detail?.max??(key==='numericCapacity'?numericTextCapacity:(this.max()??'∞'))}):error;
 }
 ngOnDestroy(){this.detach();}
 private revalidate(control:AbstractControl){const server:unknown=control.errors?.['server'];control.updateValueAndValidity({emitEvent:false});if(server!==undefined)control.setErrors({...control.errors,server},{emitEvent:false});this.validationChanged();}
 private detach(){if(this.owner){this.owner.removeValidators(this.validator);this.owner.updateValueAndValidity({emitEvent:false});this.owner=null;}}
}

import { booleanAttribute,ChangeDetectorRef,DestroyRef,Directive,inject,input,signal,type DoCheck,type WritableSignal } from '@angular/core';
import { AbstractControl,NgControl,type ControlValueAccessor } from '@angular/forms';
import type { Subscription } from 'rxjs';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import { clearServerFieldError,type FieldMessages } from './form-errors';

let sequence=0;
/** Internal query token and common form lifecycle for every shared data-entry field. */
@Directive()
export abstract class FormFieldControl<T> implements ControlValueAccessor,DoCheck{
 readonly label=input.required<string>();readonly name=input('');readonly help=input('');readonly messages=input<FieldMessages>({});
 readonly required=input(false,{transform:booleanAttribute});readonly readOnly=input(false,{transform:booleanAttribute});
 readonly id=`erp-field-${++sequence}`;readonly disabled=signal(false);abstract readonly value:WritableSignal<T>;
 readonly ngControl=inject(NgControl,{self:true,optional:true});protected readonly runtime=inject(LocalizationRuntime);
 private readonly cdr=inject(ChangeDetectorRef);private readonly revision=signal(0);private observedControl:AbstractControl|null=null;private subscription:Subscription|undefined;
 private changed:(value:T)=>void=()=>{};private touched:()=>void=()=>{};
 constructor(){if(this.ngControl)this.ngControl.valueAccessor=this;inject(DestroyRef).onDestroy(()=>this.subscription?.unsubscribe());}
 abstract writeValue(value:unknown):void;abstract focus():void;
 registerOnChange(callback:(value:T)=>void){this.changed=callback;}
 registerOnTouched(callback:()=>void){this.touched=callback;}
 setDisabledState(disabled:boolean){this.disabled.set(disabled);}
 ngDoCheck(){const control=this.ngControl?.control??null;if(control===this.observedControl)return;this.subscription?.unsubscribe();this.observedControl=control;this.subscription=control?.events.subscribe(()=>{this.revision.update(value=>value+1);this.cdr.markForCheck();});}
 error():string|null{
  this.revision();const control=this.ngControl?.control;if(!control?.invalid||!control.touched)return null;
  const server:unknown=control.errors?.['server'];if(typeof server==='string')return server;
  const first=Object.entries(control.errors??{})[0];if(!first)return null;const message=this.messages()[first[0]];
  return typeof message==='function'?message(first[1]):message??this.runtime.translate('common.validationErrors');
 }
 describedBy():string|null{return[this.help()?this.id+'-help':'',this.error()?this.id+'-error':''].filter(Boolean).join(' ')||null;}
 blur(){this.touched();}
 /** Re-evaluate shared error summaries when a constraint changes without a value event. */
 protected validationChanged(){this.revision.update(value=>value+1);this.cdr.markForCheck();}
 protected accept(value:T){if(this.disabled()||this.readOnly()||Object.is(value,this.value()))return;clearServerFieldError(this.ngControl?.control??null);this.value.set(value);this.changed(value);}
}

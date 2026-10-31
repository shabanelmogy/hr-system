import { Component,computed,effect,ElementRef,forwardRef,inject,input,signal,type OnDestroy } from '@angular/core';
import { AbstractControl,FormControl,ReactiveFormsModule,type ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Checkbox } from 'primeng/checkbox';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormFieldControl } from '../form-field-control';

@Component({selector:'erp-boolean-field',imports:[ReactiveFormsModule,Checkbox,ToggleSwitch],providers:[{provide:FormFieldControl,useExisting:forwardRef(()=>BooleanField)}],template:`
 <div class="boolean-control" [class.invalid]="!!error()" [class.locked]="readOnly()" [class.disabled]="disabled()" (focusout)="blur()" (click)="protectActivation($event)">
  @if(kind()==='switch'){
   <p-toggleswitch [formControl]="control" [inputId]="id" [name]="name()||id" [readonly]="readOnly()" [invalid]="!!error()" [ariaLabelledBy]="id+'-label'" [pt]="attributes()" [dt]="switchTokens" />
  }@else{
   <p-checkbox [formControl]="control" [inputId]="id" [name]="name()||id" [binary]="true" [readonly]="readOnly()" [invalid]="!!error()" [ariaLabelledBy]="id+'-label'" [pt]="attributes()" />
  }
  <label [id]="id+'-label'" [for]="id">{{label()}}@if(required()){<span aria-hidden="true"> *</span>}</label>
 </div>
 @if(help()){<p class="help" [id]="id+'-help'">{{help()}}</p>}
 @if(error();as message){<p class="error" [id]="id+'-error'">{{message}}</p>}
 `,styleUrl:'./boolean-field.scss'})
export class BooleanField extends FormFieldControl<boolean> implements OnDestroy{
 readonly kind=input<'checkbox'|'switch'>('checkbox');readonly value=signal(false);
 readonly control=new FormControl(false,{nonNullable:true});
 private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
 private owner:AbstractControl|null=null;
 private readonly validator:ValidatorFn=control=>typeof control.value==='boolean'?null:{booleanValue:true};
 readonly attributes=computed(()=>({input:{'aria-describedby':this.describedBy(),'aria-invalid':this.error()?'true':null,'aria-readonly':this.readOnly()?'true':null,'aria-required':this.required()?'true':null}}));
 readonly switchTokens={root:{width:'3rem',height:'1.75rem',gap:'0.25rem',background:'{form.field.border.color}',hoverBackground:'{form.field.hover.border.color}',checkedBackground:'{primary.color}',checkedHoverBackground:'{primary.color}',borderColor:'{form.field.border.color}'},handle:{size:'1.125rem',background:'{content.background}',checkedBackground:'{primary.contrast.color}',checkedHoverBackground:'{primary.contrast.color}'}};
 constructor(){super();effect(()=>{this.control.setValue(this.value(),{emitEvent:false});if(this.disabled())this.control.disable({emitEvent:false});else this.control.enable({emitEvent:false});});this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe(value=>this.choose(value));}
 override ngDoCheck(){super.ngDoCheck();const control=this.ngControl?.control??null;if(control===this.owner)return;this.detach();this.owner=control;if(control){const server:unknown=control.errors?.['server'];control.addValidators(this.validator);control.updateValueAndValidity({emitEvent:false});if(server!==undefined)control.setErrors({...control.errors,server},{emitEvent:false});this.validationChanged();}}
 writeValue(value:unknown){this.value.set(value===true);}
 focus(){this.host.nativeElement.querySelector<HTMLInputElement>('input')?.focus();}
 choose(value:unknown){if(typeof value==='boolean')this.accept(value);this.control.setValue(this.value(),{emitEvent:false});}
 /** Native checkbox activation ignores readonly; cancel its default while retaining focusability. */
 protectActivation(event:Event){if(this.readOnly()||this.disabled())event.preventDefault();}
 override error(){const error=super.error(),control=this.ngControl?.control;return error&&control?.errors?.['booleanValue']&&!control.errors['server']&&!this.messages()['booleanValue']?this.runtime.translate('booleanField.invalid'):error;}
 ngOnDestroy(){this.detach();}
 private detach(){if(this.owner){this.owner.removeValidators(this.validator);this.owner.updateValueAndValidity({emitEvent:false});this.owner=null;}}
}

import { Component,computed,effect,forwardRef,inject,input,untracked,viewChild,type OnDestroy } from '@angular/core';
import { AbstractControl,FormControl,ReactiveFormsModule,type ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';
import { Times } from '@primeicons/angular/times';
import { UiTextPipe } from '../../../../platform/localization/public-api';
import { CalendarLocale } from '../../../../../theme/calendar-public-api';
import { PopoverPanel } from '../../overlays/popover-panel';
import { FormFieldControl } from '../form-field-control';
import { TextField } from './text-field';
import { dateOnlyErrors,dateOnlyToLocal,firstDateOnly,lastDateOnly,localToDateOnly,normalizeDateDigits } from './date-only';

@Component({selector:'erp-date-field',imports:[InputText,ButtonDirective,UiTextPipe,PopoverPanel,DatePicker,ReactiveFormsModule,Times],providers:[{provide:FormFieldControl,useExisting:forwardRef(()=>DateField)}],template:`
 <label [for]="id" [class.invalid]="!!error()">{{label()}}@if(required()){<span aria-hidden="true"> *</span>}</label>
 <div class="input-row" [class.invalid]="!!error()">
  <input #input pInputText [id]="id" type="text" dir="ltr" [value]="value()" [placeholder]="'YYYY-MM-DD'" [disabled]="disabled()" [readOnly]="readOnly()" autocomplete="off" [attr.name]="name()||id" [attr.aria-required]="required()?'true':null" [invalid]="!!error()" [attr.aria-invalid]="error()?'true':null" [attr.aria-describedby]="describedBy()" (input)="onInput($event)" (blur)="blur()" (compositionstart)="composing=true" (compositionend)="compositionEnd($event)" />
  @if(showClear()&&value()&&!readOnly()&&!disabled()){
   <button pButton [iconOnly]="true" variant="text" type="button" class="field-action" [attr.aria-label]="'general.clear'|uiText" (click)="clear()"><svg data-p-icon="times" class="clear-icon" aria-hidden="true"></svg></button>
  }
  <erp-popover-panel #calendar [label]="('dateField.chooseDate'|uiText)+' · '+label()" [disabled]="readOnly()||disabled()||boundsInvalid()||manualOnly()">
   <svg popoverTrigger aria-hidden="true" viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8 2v4m8-4v4M5 9h14m-10 4h2m2 0h2m-6 3h2"/></svg>
   <div (keydown.escape)="dismiss($event)">
    @defer (when calendar.opened()) {
    <p-datepicker [formControl]="calendarControl" [inline]="true" [minDate]="calendarMin()" [maxDate]="calendarMax()" [ariaLabel]="label()" [pt]="calendarAttributes" [dt]="calendarTokens" />
    } @loading { <p role="status">{{'common.loading'|uiText}}</p> } @error { <p role="alert">{{'common.error'|uiText}}</p> }
   </div>
  </erp-popover-panel>
 </div>
 @if(help()){<p class="help" [id]="id+'-help'">{{help()}}</p>}
 @if(manualOnly()){<p class="help" [id]="id+'-calendar-help'">{{'dateField.earlyYearsHelp'|uiText}}</p>}
 @if(error();as message){<p class="error" [id]="id+'-error'">{{message}}</p>}
 `,styleUrl:'./text-field.scss'})
export class DateField extends TextField implements OnDestroy{
 readonly min=input(firstDateOnly);readonly max=input(lastDateOnly);
 private readonly localeAdapter=inject(CalendarLocale);
 private readonly calendar=viewChild<PopoverPanel>('calendar');
 private owner:AbstractControl|null=null;
 private readonly validator:ValidatorFn=control=>dateOnlyErrors(control.value,this.min(),this.max());
 readonly boundsInvalid=computed(()=>dateOnlyErrors('',this.min(),this.max())!==null);
 // PrimeNG's Date constructors map years0..99 to1900..1999; keep those days manual.
 readonly manualOnly=computed(()=>this.max()<'0100-01-01'||(this.value()!==''&&!dateOnlyErrors(this.value())&&this.value()<'0100-01-01'));
 readonly calendarControl=new FormControl<Date|null>(null);
 readonly calendarMin=computed(()=>dateOnlyToLocal(this.min()<'0100-01-01'?'0100-01-01':this.min())??undefined);
 readonly calendarMax=computed(()=>dateOnlyToLocal(this.max())??undefined);
 readonly calendarAttributes={panel:{style:{padding:'0',border:'0',boxShadow:'none',background:'transparent',width:'100%'}}};
 readonly calendarTokens={date:{width:'2.5rem',height:'2.5rem'},panel:{padding:'0'},colorScheme:{light:{date:{selectedBackground:'{primary.color}',selectedColor:'{primary.contrast.color}'}},dark:{date:{selectedBackground:'{primary.color}',selectedColor:'{primary.contrast.color}'}}}};
 constructor(){super();effect(()=>{this.min();this.max();untracked(()=>{this.owner?.updateValueAndValidity();this.calendar()?.close();});});effect(()=>{if(this.disabled()||this.readOnly())untracked(()=>this.calendar()?.close());});
  effect(()=>{this.calendarControl.setValue(dateOnlyToLocal(this.value()),{emitEvent:false});if(this.disabled()||this.readOnly()||this.boundsInvalid())this.calendarControl.disable({emitEvent:false});else this.calendarControl.enable({emitEvent:false});});
  this.calendarControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(value=>this.choose(value));
 }
 override ngDoCheck(){
  super.ngDoCheck();const control=this.ngControl?.control??null;if(control===this.owner)return;
  this.detach();this.owner=control;if(control){control.addValidators(this.validator);control.updateValueAndValidity();}
 }
 override writeValue(value:unknown){super.writeValue(value);this.calendar()?.close();}
 override describedBy(){return[this.help()?this.id+'-help':'',this.error()?this.id+'-error':'',this.manualOnly()?this.id+'-calendar-help':''].filter(Boolean).join(' ')||null;}
 override onInput(event:Event){if(event.target instanceof HTMLInputElement&&!this.composing)event.target.value=normalizeDateDigits(event.target.value);super.onInput(event);}
 override clear(){if(this.disabled()||this.readOnly())return;super.clear();this.calendar()?.close();}
 override error():string|null{
  const error=super.error(),control=this.ngControl?.control;if(!error||!control)return error;
  if(control.errors?.['server'])return error;
  const key=Object.keys(control.errors??{})[0];if(!key||this.messages()[key])return error;
  if(key==='dateOnly')return this.runtime.translate('validation.invalidDate');
  if(key==='dateBounds')return this.runtime.translate('dateField.invalidBounds');
  if(key==='dateRange')return this.runtime.translate('dateField.outOfRange','core',{min:this.min(),max:this.max()});
  return error;
 }
 choose(value:unknown){
  const date=localToDateOnly(value);if(date===null||this.disabled()||this.readOnly()||this.manualOnly()||date<'0100-01-01'||dateOnlyErrors(date,this.min(),this.max()))return;
  this.accept(date);this.blur();this.calendar()?.close();
 }
 dismiss(event:Event){event.preventDefault();event.stopPropagation();this.calendar()?.close();}
 ngOnDestroy(){this.detach();}
 private detach(){if(this.owner){this.owner.removeValidators(this.validator);this.owner.updateValueAndValidity({emitEvent:false});this.owner=null;}}
}

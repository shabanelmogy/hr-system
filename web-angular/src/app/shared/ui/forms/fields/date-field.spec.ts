import { Component,signal } from '@angular/core';
import { FormControl,FormGroup,ReactiveFormsModule,Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideAppTheme } from '../../../../../theme/public-api';
import { LocalizationRuntime } from '../../../../platform/localization/public-api';
import { FormContainer } from '../form-container';
import { applyServerFieldErrors } from '../form-errors';
import { DateField } from './date-field';
import { dateOnlyToLocal } from './date-only';

@Component({imports:[ReactiveFormsModule,FormContainer,DateField],template:`<erp-form [form]="form" title="Date fixture" submitLabel="Save fixture"><erp-date-field [formControl]="form.controls.date" label="Day fixture" help="YYYY-MM-DD" [readOnly]="readonly()" [min]="min()" [max]="max()" [messages]="messages" /></erp-form>`})
class Composition{
 readonly form=new FormGroup({date:new FormControl('',{nonNullable:true,validators:Validators.required})});readonly readonly=signal(false);readonly min=signal('0001-01-01');readonly max=signal('9999-12-31');readonly messages={required:'Required fixture'};
}
describe('DateField in shared forms',()=>{
 beforeEach(async()=>{TestBed.configureTestingModule({providers:[provideAppTheme()]});await TestBed.inject(LocalizationRuntime).loadNamespace('core');});
 async function setup(){const fixture=TestBed.createComponent(Composition);await fixture.whenStable();const field=fixture.debugElement.query(By.directive(DateField)).componentInstance as DateField;return{fixture,field,owner:fixture.componentInstance,root:fixture.nativeElement as HTMLElement};}
 it('uses one shared field/error/summary and keeps submit enabled with first-error focus',async()=>{
  const{fixture,root}=await setup();const submit=root.querySelector<HTMLButtonElement>('button[type=submit]')!;expect(submit.disabled).toBe(false);expect(root.querySelector('form')?.noValidate).toBe(true);submit.click();await fixture.whenStable();expect(root.querySelectorAll('.error')).toHaveLength(1);expect(root.querySelectorAll('.error-summary a')).toHaveLength(1);expect(document.activeElement).toBe(root.querySelector('input'));expect(root.querySelector('input')?.getAttribute('aria-describedby')).toContain('-error');
 });
 it('retains invalid input and server errors only clear on user changes, not writeValue',async()=>{
  const{fixture,field,owner,root}=await setup();const input=root.querySelector('input')!;input.value='2024-02-30';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('blur'));await fixture.whenStable();expect(owner.form.controls.date.value).toBe('2024-02-30');expect(owner.form.controls.date.errors).toHaveProperty('dateOnly');expect(input.value).toBe('2024-02-30');
  applyServerFieldErrors(owner.form,{date:'Server fixture'});field.writeValue('2024-02-28');await fixture.whenStable();expect(field.error()).toBe('Server fixture');input.value='٢٠٢٤-٠٢-٢٩';input.dispatchEvent(new Event('input',{bubbles:true}));await fixture.whenStable();expect(owner.form.controls.date.value).toBe('2024-02-29');expect(owner.form.controls.date.valid).toBe(true);expect(owner.form.controls.date.dirty).toBe(true);
 });
 it('keeps model writes/reset silent and validates unsupported programmatic values',async()=>{
  const{fixture,field,owner,root}=await setup();const changes=vi.fn();owner.form.controls.date.valueChanges.subscribe(changes);field.writeValue('0001-01-01');await fixture.whenStable();expect(root.querySelector('input')?.value).toBe('0001-01-01');expect(changes).not.toHaveBeenCalled();owner.form.controls.date.setValue('2024-02-29');await fixture.whenStable();owner.form.reset();await fixture.whenStable();expect(field.value()).toBe('');expect(owner.form.controls.date.pristine).toBe(true);expect(owner.form.controls.date.errors).toHaveProperty('required');
  owner.form.controls.date.setValue('2024-02-29T00:00:00Z');await fixture.whenStable();expect(owner.form.controls.date.errors).toHaveProperty('dateOnly');
 });
 it('validates inclusive dynamic bounds and fails closed with invalid bounds',async()=>{
  const{fixture,owner}=await setup();owner.form.controls.date.setValue('2024-02-29');owner.min.set('2024-02-29');owner.max.set('2024-02-29');await fixture.whenStable();expect(owner.form.valid).toBe(true);owner.min.set('2024-03-01');await fixture.whenStable();expect(owner.form.controls.date.errors).toHaveProperty('dateBounds');owner.min.set('2024-01-01');owner.max.set('2024-02-28');await fixture.whenStable();expect(owner.form.controls.date.errors).toHaveProperty('dateRange');
 });
 it('blocks stale calendar/clear/input callbacks while readonly or disabled and allows one valid selection',async()=>{
  const{fixture,field,owner}=await setup();owner.form.controls.date.setValue('2024-02-29');owner.readonly.set(true);await fixture.whenStable();field.choose(dateOnlyToLocal('2024-03-01'));field.clear();expect(owner.form.controls.date.value).toBe('2024-02-29');owner.readonly.set(false);owner.form.disable();await fixture.whenStable();field.choose(dateOnlyToLocal('2024-03-01'));field.clear();expect(owner.form.controls.date.value).toBe('2024-02-29');owner.form.enable();await fixture.whenStable();const changes=vi.fn();owner.form.controls.date.valueChanges.subscribe(changes);field.choose(dateOnlyToLocal('2024-03-01'));await fixture.whenStable();expect(owner.form.controls.date.value).toBe('2024-03-01');expect(changes).toHaveBeenCalledOnce();expect(owner.form.controls.date.touched).toBe(true);
 });
 it('detaches only its own validator on control replacement and destruction',async()=>{
  const{fixture,owner}=await setup(),old=owner.form.controls.date;old.setValue('bad');expect(old.errors).toHaveProperty('dateOnly');const next=new FormControl('bad',{nonNullable:true,validators:Validators.required});owner.form.setControl('date',next);await fixture.whenStable();expect(old.errors).toBeNull();expect(next.errors).toHaveProperty('dateOnly');fixture.destroy();expect(next.errors).toBeNull();next.setValue('');expect(next.errors).toHaveProperty('required');
 });
 it('keeps years below100 manual and prevents the vendor calendar from remapping their century',async()=>{
  const{fixture,field,owner,root}=await setup();owner.form.controls.date.setValue('0001-01-01');await fixture.whenStable();expect(owner.form.valid).toBe(true);expect(field.manualOnly()).toBe(true);expect(root.querySelector('input')?.value).toBe('0001-01-01');field.choose(dateOnlyToLocal('1901-01-01'));expect(owner.form.controls.date.value).toBe('0001-01-01');expect(root.querySelector('erp-popover-panel button')?.hasAttribute('disabled')).toBe(true);owner.form.controls.date.setValue('2024-02-29');await fixture.whenStable();expect(field.manualOnly()).toBe(false);field.choose(dateOnlyToLocal('0099-12-31'));expect(owner.form.controls.date.value).toBe('2024-02-29');
 });
});

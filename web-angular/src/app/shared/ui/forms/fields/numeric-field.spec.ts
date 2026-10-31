import { Component,signal } from '@angular/core';
import { FormControl,FormGroup,ReactiveFormsModule,Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';import { By } from '@angular/platform-browser';
import { provideAppTheme } from '../../../../../theme/public-api';
import { LocalizationRuntime } from '../../../../platform/localization/public-api';
import { uiCatalogVersion } from '../../../../platform/localization/catalog.generated';
import { FormContainer } from '../form-container';import { applyServerFieldErrors } from '../form-errors';
import { NumericField } from './numeric-field';
@Component({imports:[ReactiveFormsModule,FormContainer,NumericField],template:`<erp-form [form]="form" title="Numeric fixture" submitLabel="Save fixture"><erp-numeric-field [formControl]="form.controls.value" label="Value fixture" help="Decimal fixture" [mode]="mode()" [readOnly]="readonly()" [min]="min()" [max]="max()" [maxFractionDigits]="scale()" [messages]="messages" /></erp-form>`})
class Composition{
 readonly form=new FormGroup({value:new FormControl('',{nonNullable:true,validators:Validators.required})});readonly readonly=signal(false);readonly mode=signal<'decimal'|'integer'>('decimal');readonly min=signal<string|null>(null);readonly max=signal<string|null>(null);readonly scale=signal<number|null>(null);readonly messages={required:'Required fixture'};
}
describe('NumericField in the shared form',()=>{
 beforeEach(async()=>{TestBed.configureTestingModule({providers:[provideAppTheme()]});await TestBed.inject(LocalizationRuntime).loadNamespace('core');});
 async function setup(){const fixture=TestBed.createComponent(Composition);await fixture.whenStable();const field=fixture.debugElement.query(By.directive(NumericField)).componentInstance as NumericField;const root=fixture.nativeElement as HTMLElement;return{fixture,field,owner:fixture.componentInstance,root,input:root.querySelector('input')!};}
 it('uses exactly one shared summary/field and enabled submit/first-error focus',async()=>{
  const{fixture,root,input}=await setup();const submit=root.querySelector<HTMLButtonElement>('button[type=submit]')!;expect(submit.disabled).toBe(false);expect(root.querySelector('form')!.noValidate).toBe(true);submit.click();await fixture.whenStable();expect(root.querySelectorAll('.error')).toHaveLength(1);expect(root.querySelectorAll('.error-summary a')).toHaveLength(1);expect(document.activeElement).toBe(input);expect(input.getAttribute('aria-describedby')).toContain('-error');expect(input.type).toBe('text');expect(input.inputMode).toBe('decimal');expect(input.dir).toBe('ltr');
 });
 it('preserves long exact values and zeros on user edits and silent write/reset',async()=>{
  const{fixture,field,owner,input}=await setup();const changed=vi.fn();owner.form.controls.value.valueChanges.subscribe(changed);field.writeValue('9007199254740993.000');await fixture.whenStable();expect(input.value).toBe('9007199254740993.000');expect(changed).not.toHaveBeenCalled();input.value='000123.450000000000001';input.dispatchEvent(new Event('input',{bubbles:true}));await fixture.whenStable();expect(owner.form.controls.value.value).toBe('000123.450000000000001');expect(changed).toHaveBeenCalledOnce();expect(owner.form.valid).toBe(true);owner.form.reset();await fixture.whenStable();expect(input.value).toBe('');expect(owner.form.controls.value.pristine).toBe(true);
 });
 it('retains incomplete input and only clears server errors on a real normalized edit',async()=>{
  const{fixture,owner,input,field}=await setup();input.value='1.';input.dispatchEvent(new Event('input'));input.dispatchEvent(new Event('blur'));await fixture.whenStable();expect(owner.form.controls.value.errors).toHaveProperty('numericText');expect(input.value).toBe('1.');applyServerFieldErrors(owner.form,{value:'Server fixture'});field.writeValue('1.1');await fixture.whenStable();expect(field.error()).toBe('Server fixture');input.value='−١٢٫٣٤٠';input.dispatchEvent(new Event('input'));await fixture.whenStable();expect(input.value).toBe('-12.340');expect(owner.form.controls.value.value).toBe('-12.340');expect(field.error()).toBeNull();
 });
 it('updates constraints, summary and mode without value changes/dirty state or server error loss',async()=>{
  const{fixture,owner,root,input}=await setup();owner.form.controls.value.setValue('1.234');owner.form.markAllAsTouched();await fixture.whenStable();const changes=vi.fn();owner.form.valueChanges.subscribe(changes);owner.scale.set(2);await fixture.whenStable();expect(owner.form.controls.value.errors).toHaveProperty('numericScale');expect(root.querySelectorAll('.error-summary a')).toHaveLength(1);expect(owner.form.controls.value.pristine).toBe(true);expect(changes).not.toHaveBeenCalled();owner.mode.set('integer');await fixture.whenStable();expect(input.inputMode).toBe('numeric');expect(owner.form.controls.value.errors).toHaveProperty('numericInteger');applyServerFieldErrors(owner.form,{value:'Server fixture'});owner.max.set('0');await fixture.whenStable();expect(root.querySelector('.error')?.textContent).toBe('Server fixture');expect(changes).not.toHaveBeenCalled();
 });
 it('honors readonly/disabled and IME without accepting stale callbacks',async()=>{
  const{fixture,owner,input,field}=await setup();owner.form.controls.value.setValue('10');owner.readonly.set(true);await fixture.whenStable();input.value='١٢';field.onInput(new Event('input'));field.clear();expect(owner.form.controls.value.value).toBe('10');owner.readonly.set(false);owner.form.disable();await fixture.whenStable();field.clear();expect(owner.form.controls.value.value).toBe('10');owner.form.enable();await fixture.whenStable();input.dispatchEvent(new CompositionEvent('compositionstart'));input.value='١٢٫٣';input.dispatchEvent(new InputEvent('input',{isComposing:true}));expect(owner.form.controls.value.value).toBe('10');input.dispatchEvent(new CompositionEvent('compositionend'));await fixture.whenStable();expect(owner.form.controls.value.value).toBe('12.3');
 });
 it('does not silently fix out-of-range input on blur and clear participates in required validation',async()=>{
  const{fixture,owner,input,field}=await setup();owner.min.set('0');owner.max.set('2');await fixture.whenStable();input.value='3';input.dispatchEvent(new Event('input'));input.dispatchEvent(new Event('blur'));await fixture.whenStable();expect(owner.form.controls.value.value).toBe('3');expect(field.error()).toBeTruthy();expect(input.value).toBe('3');field.clear();await fixture.whenStable();expect(owner.form.controls.value.errors).toHaveProperty('required');expect(document.activeElement).toBe(input);
 });
 it('detaches only its own validator on replacement and destruction',async()=>{
  const{fixture,owner}=await setup();const old=owner.form.controls.value;old.setValue('bad');expect(old.errors).toHaveProperty('numericText');const next=new FormControl('bad',{nonNullable:true,validators:Validators.required});owner.form.setControl('value',next);await fixture.whenStable();expect(old.errors).toBeNull();expect(next.errors).toHaveProperty('numericText');fixture.destroy();expect(next.errors).toBeNull();next.setValue('');expect(next.errors).toHaveProperty('required');
 });
 it('renders SQL-backed numeric caption overrides and restores baseline after scope loss',async()=>{
  const{fixture,owner,root}=await setup();const locale=TestBed.inject(LocalizationRuntime);locale.setLanguage('en');const generation=locale.transition({userId:'fixture',tenantId:'tenant',companyId:1,roles:[],permissions:[]});
  expect(locale.applyCompany({catalogVersion:uiCatalogVersion,tenantId:'tenant',companyId:1,defaultLanguage:'en',revision:1,overrides:[{namespace:'core',key:'numericField.invalid',language:'en',value:'Scoped numeric error'}]},generation)).toBe(true);owner.form.controls.value.setValue('bad');owner.form.markAllAsTouched();await fixture.whenStable();expect(root.querySelector('.error')?.textContent).toBe('Scoped numeric error');locale.transition(null);await fixture.whenStable();expect(root.querySelector('.error')?.textContent).not.toBe('Scoped numeric error');expect(owner.form.controls.value.value).toBe('bad');
 });
});

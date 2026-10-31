import { Component,signal } from '@angular/core';
import { FormControl,FormGroup,ReactiveFormsModule,Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideAppTheme } from '../../../../../theme/public-api';
import { LocalizationRuntime } from '../../../../platform/localization/public-api';
import { FormContainer } from '../form-container';
import { applyServerFieldErrors } from '../form-errors';
import { ReferenceField } from './reference-field';
import { TextField } from './text-field';
import type { ReferenceId,ReferenceSelection,ReferenceSource } from './reference.types';
const query={scopeKey:'fixture-one',search:''};
@Component({imports:[ReactiveFormsModule,FormContainer,ReferenceField,TextField],template:`
 <erp-form [form]="form" title="Field fixture" submitLabel="Save fixture">
  <erp-text-field [formControl]="form.controls.name" label="Name fixture" [messages]="messages" />
  <erp-reference-field [formControl]="form.controls.reference" label="Reference fixture" [source]="source()" [selection]="selection()" [readOnly]="readonly()" [messages]="messages" />
 </erp-form>`})
class Composition{
 readonly form=new FormGroup({name:new FormControl('',Validators.required),reference:new FormControl<ReferenceId|null>(null,Validators.required)});
 readonly messages={required:'Required fixture'};readonly readonly=signal(false);
 readonly source=signal<ReferenceSource>({query,kind:'ready',result:{query,options:[{value:0,label:'Zero'},{value:'0',label:'String zero'},{value:2,label:'Blocked',disabled:true}],hasMore:false}});
 readonly selection=signal<ReferenceSelection|null>({scopeKey:query.scopeKey,value:91,kind:'ready',option:{value:91,label:'Off page'}});
}
describe('Reference field in the shared form system',()=>{
 it('does not emit a stale load-more command after exhaustion, readonly or query replacement',async()=>{
  const{fixture,field,owner}=await setup();const requested=vi.fn();field.loadMore.subscribe(requested);field.requestMore();expect(requested).not.toHaveBeenCalled();
  owner.source.update(source=>({...source,result:{...source.result!,hasMore:true}}));await fixture.whenStable();field.requestMore();expect(requested).toHaveBeenCalledOnce();
  owner.readonly.set(true);await fixture.whenStable();field.requestMore();expect(requested).toHaveBeenCalledOnce();
  owner.readonly.set(false);owner.source.update(source=>({...source,query:{...query,search:'replacement'}}));await fixture.whenStable();field.requestMore();expect(requested).toHaveBeenCalledOnce();
 });
 beforeEach(async()=>{TestBed.configureTestingModule({providers:[provideAppTheme()]});await TestBed.inject(LocalizationRuntime).loadNamespace('core');});
 async function setup(){const fixture=TestBed.createComponent(Composition);await fixture.whenStable();const field=fixture.debugElement.query(By.directive(ReferenceField)).componentInstance as ReferenceField;return{fixture,field,owner:fixture.componentInstance,root:fixture.nativeElement as HTMLElement};}
 it('discovers text and reference errors in DOM order and focuses via summary links',async()=>{
  const{fixture,root}=await setup();root.querySelector<HTMLButtonElement>('button[type=submit]')!.click();await fixture.whenStable();
  expect(root.querySelectorAll('.error')).toHaveLength(2);const links=root.querySelectorAll<HTMLAnchorElement>('.error-summary a');expect(links).toHaveLength(2);links[1].click();await fixture.whenStable();
  const combo=root.querySelector('[role=combobox]');expect(document.activeElement).toBe(combo);expect(combo?.getAttribute('aria-describedby')).toContain('-error');expect(combo?.getAttribute('aria-invalid')).toBe('true');
 });
 it('keeps writes silent and preserves typed/off-page selection on source replacement',async()=>{
  const{fixture,field,owner}=await setup();owner.form.controls.reference.setValue(91);await fixture.whenStable();expect(field.selectedCaption()).toBe('Off page');
  const changes=vi.fn();owner.form.controls.reference.valueChanges.subscribe(changes);owner.source.set({...owner.source(),query:{...query,search:'next'}});await fixture.whenStable();expect(changes).not.toHaveBeenCalled();expect(field.value()).toBe(91);expect(field.selectedCaption()).toBe('Off page');
  owner.source.set({...owner.source(),query:{scopeKey:'other-scope',search:''}});await fixture.whenStable();expect(field.selectedCaption()).not.toBe('Off page');expect(owner.form.controls.reference.value).toBe(91);
 });
 it('accepts only current enabled options and clears server errors only on a user edit',async()=>{
  const{fixture,field,owner}=await setup();applyServerFieldErrors(owner.form,{reference:'Server fixture'});await fixture.whenStable();
  field.choose(2);expect(field.error()).toBe('Server fixture');field.choose(0);await fixture.whenStable();expect(owner.form.controls.reference.value).toBe(0);expect(field.error()).toBeNull();expect(owner.form.controls.reference.dirty).toBe(true);
  field.choose('0');await fixture.whenStable();expect(owner.form.controls.reference.value).toBe('0');
 });
 it('guards stale callbacks/readonly/disabled, and clear/reset follows form validation',async()=>{
  const{fixture,field,owner}=await setup();field.choose(0);owner.readonly.set(true);await fixture.whenStable();field.choose('0');field.clear();expect(owner.form.controls.reference.value).toBe(0);
  owner.readonly.set(false);owner.form.controls.reference.disable();await fixture.whenStable();field.choose('0');expect(owner.form.controls.reference.value).toBe(0);
  owner.form.controls.reference.enable();await fixture.whenStable();field.clear();await fixture.whenStable();expect(owner.form.controls.reference.value).toBeNull();expect(field.error()).toBe('Required fixture');
  owner.form.controls.reference.reset('0');await fixture.whenStable();expect(field.value()).toBe('0');expect(field.error()).toBeNull();owner.source.set({...owner.source(),query:{...query,search:'pending'}});await fixture.whenStable();field.choose(0);expect(owner.form.controls.reference.value).toBe('0');
 });
});

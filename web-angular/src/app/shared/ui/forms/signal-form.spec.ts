import { Component, input, resource, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { applyEach, form, FormField, hidden, required, submit, validate, validateAsync, type FieldTree } from '@angular/forms/signals';
import { provideAppTheme } from '../../../../theme/public-api';
import { FormContainer, ReferenceField, TextField, type ReferenceSource } from './public-api';

@Component({
  imports: [FormContainer, TextField, FormField],
  template: `<erp-form [form]="form" title="Signal fixture" submitLabel="Save">
    <erp-text-field [formField]="form.name" label="Name" [messages]="{required:'Required fixture'}" />
  </erp-form>`,
})
class SignalComposition {
  readonly model = signal({ name: '' });
  readonly shell = viewChild.required(FormContainer);
  readonly action = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  readonly form = form(this.model, path => required(path.name), {
    submission: { ignoreValidators: 'none', action: async () => this.action() },
  });
}

@Component({ selector: 'nested-fields', imports: [FormField, TextField], template: `<erp-text-field [formField]="fields().street" label="Street" />` })
class NestedFields { readonly fields = input.required<FieldTree<{street:string}>>(); }

@Component({ imports: [FormContainer, TextField, FormField, NestedFields], template: `
  <erp-form [form]="form" title="Nested fixture" submitLabel="Save">
    @if (!form.address().hidden()) { <nested-fields [fields]="form.address" /> }
    @for (row of form.rows; track row) { <erp-text-field [formField]="row.name" label="Row name" /> }
    <erp-text-field [formField]="form.confirmation" label="Confirmation" />
  </erp-form>` })
class NestedComposition {
  readonly model = signal({ useAddress: true, address: {street:''}, rows: [{name:'First'}], confirmation:'First' });
  readonly action = vi.fn().mockResolvedValue(undefined);
  readonly form = form(this.model, p => {
    required(p.address.street, {message:'Street is required'});
    hidden(p.address, {when:({valueOf})=>!valueOf(p.useAddress)});
    applyEach(p.rows, row=>required(row.name, {message:'Row is required'}));
    validate(p.confirmation, ({value,valueOf})=>value()===valueOf(p.rows)[0]?.name?undefined:{kind:'match',message:'Confirmation must match first row'});
  }, {submission:{ignoreValidators:'none', action:async()=>this.action()}});
}

@Component({imports:[FormField,FormContainer,ReferenceField],template:`
  <erp-form [form]="form" title="Reference fixture" submitLabel="Save">
    <erp-reference-field [formField]="form.country" label="Country" [source]="source" />
  </erp-form>`})
class ReferenceComposition {
  readonly source:ReferenceSource={query:{scopeKey:'fixture',search:''},kind:'ready',result:{query:{scopeKey:'fixture',search:''},hasMore:false,options:[{value:1,label:'First country'}]}};
  readonly form=form(signal({country:null as number|null}),path=>required(path.country,{message:'Country is required'}),{submission:{ignoreValidators:'none',action:async()=>undefined}});
  readonly field=viewChild.required(ReferenceField);
}

describe('Native Signal Forms shared composition', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideAppTheme()] }));

  it('keeps invalid Save enabled and focuses the invalid shared input', async () => {
    const fixture = TestBed.createComponent(SignalComposition);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const button = root.querySelector<HTMLButtonElement>('button[type=submit]')!;
    expect(button.disabled).toBe(false);
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.action).not.toHaveBeenCalled();
    expect(root.querySelector('.error')?.textContent).toBe('Required fixture');
    expect(document.activeElement).toBe(root.querySelector('input'));
  });

  it('awaits the configured native action and prevents repeated dispatches', async () => {
    const fixture = TestBed.createComponent(SignalComposition);
    const owner = fixture.componentInstance;
    let finish!: () => void;
    owner.action.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
    owner.model.set({ name: 'Valid fixture' });
    await fixture.whenStable();
    const event = () => new Event('submit', { cancelable: true });
    const request = owner.shell().submit(event());
    void owner.shell().submit(event());
    expect(owner.action).toHaveBeenCalledOnce();
    expect(owner.form().submitting()).toBe(true);
    finish();
    await request;
    await fixture.whenStable();
    expect(owner.form().submitting()).toBe(false);
  });

  it('includes and focuses fields rendered inside a nested component', async () => {
    const fixture=TestBed.createComponent(NestedComposition);
    fixture.componentInstance.form.confirmation().value.set('Wrong');
    await fixture.whenStable();
    const root:HTMLElement=fixture.nativeElement;
    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
    expect(root.querySelector('.error-summary')?.textContent).toContain('Street is required');
    expect(root.querySelectorAll('.error-summary a')).toHaveLength(2);
    expect(document.activeElement).toBe(root.querySelector('nested-fields input'));
  });

  it('uses native conditional, cross-field and array validation without a renderer', async () => {
    const fixture=TestBed.createComponent(NestedComposition),owner=fixture.componentInstance;
    owner.model.update(value=>({...value,useAddress:false,rows:[...value.rows,{name:''}]}));
    await fixture.whenStable();
    const root:HTMLElement=fixture.nativeElement;
    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
    expect(root.querySelector('nested-fields')).toBeNull();
    expect(root.querySelectorAll('.error')).toHaveLength(1);
    owner.form.rows[1].name().value.set('Second');
    owner.form.confirmation().value.set('Wrong');
    await fixture.whenStable();
    expect(root.querySelector('.error-summary')?.textContent).toContain('Confirmation must match first row');
    owner.form.confirmation().value.set('First');
    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
    expect(owner.action).toHaveBeenCalledOnce();
  });

  it('displays root submission errors in the shared summary', async () => {
    const fixture=TestBed.createComponent(NestedComposition),owner=fixture.componentInstance;
    owner.model.update(value=>({...value,useAddress:false}));
    owner.action.mockResolvedValue({kind:'server',message:'Form-level rejection',fieldTree:owner.form});
    await fixture.whenStable();
    const root:HTMLElement=fixture.nativeElement;
    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
    expect(root.querySelector('.error-summary')?.textContent).toContain('Form-level rejection');
  });

  it('binds a native reference field with its nullable domain value and native focus',async()=>{
    const fixture=TestBed.createComponent(ReferenceComposition),owner=fixture.componentInstance;
    await fixture.whenStable();
    const root:HTMLElement=fixture.nativeElement;
    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click();await fixture.whenStable();
    expect(root.querySelector('.error')?.textContent).toBe('Country is required');
    expect(document.activeElement?.getAttribute('role')).toBe('combobox');
    owner.field().choose(1);await fixture.whenStable();
    expect(owner.form.country().value()).toBe(1);expect(owner.form().valid()).toBe(true);
    owner.field().clear();await fixture.whenStable();expect(owner.form.country().value()).toBeNull();
    expect(owner.form().invalid()).toBe(true);
  });

  it('does not dispatch while a native async validator is pending', async () => {
    let complete!:(value:boolean)=>void;
    const action=vi.fn().mockResolvedValue(undefined);
    const fields=TestBed.runInInjectionContext(()=>form(signal({name:'Existing'}),p=>{
      validateAsync(p.name,{
        params:({value})=>value(),
        factory:params=>resource({params,loader:()=>new Promise<boolean>(resolve=>{complete=resolve;})}),
        onSuccess:()=>undefined,onError:()=>({kind:'unavailable',message:'Check unavailable'}),
      });
    },{submission:{ignoreValidators:'none',action}}));
    TestBed.tick();
    expect(fields().pending()).toBe(true);
    expect(await submit(fields)).toBe(false);
    expect(action).not.toHaveBeenCalled();
    complete(true);await TestBed.inject((await import('@angular/core')).ApplicationRef).whenStable();TestBed.tick();
    expect(await submit(fields)).toBe(true);
    expect(action).toHaveBeenCalledOnce();
  });
});

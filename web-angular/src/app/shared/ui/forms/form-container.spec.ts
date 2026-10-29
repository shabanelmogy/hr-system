import { Component, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../theme/public-api';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import { applyServerFieldErrors, clearServerFieldError, FormContainer, TextField } from './public-api';

@Component({
  imports: [ReactiveFormsModule, FormContainer, TextField],
  template: `
    <erp-form [form]="form" title="Access fixture" submitLabel="Continue fixture" [pending]="pending()" [readOnly]="readonly()" (validSubmit)="submit()">
      <erp-text-field [formControl]="emailControl()" label="Email fixture" type="email" required [messages]="messages" />
      <erp-text-field [formControl]="form.controls.secret" label="Password fixture" type="password" [readOnly]="readonly()" required [messages]="messages" />
    </erp-form>
  `,
})
class AccessComposition {
  readonly form = new FormGroup({ email: new FormControl<string | null>('', [Validators.required, Validators.email]), secret: new FormControl<string | null>('', Validators.required) });
  readonly emailControl = signal(this.form.controls.email);
  readonly messages = { required: 'Required fixture', email: 'Invalid email fixture' };
  readonly pending = signal(false);
  readonly readonly = signal(false);
  count = 0;
  submit(): void { this.count++; this.pending.set(true); }
}

@Component({
  imports: [ReactiveFormsModule, FormContainer, TextField],
  template: `
    <erp-form [form]="form" title="Profile fixture" submitLabel="Save fixture" (validSubmit)="count = count + 1">
      <div><erp-text-field [formControl]="form.controls.profile.controls.name" label="Name fixture" [messages]="messages" /></div>
    </erp-form>
  `,
})
class ProfileComposition {
  readonly form = new FormGroup({ profile: new FormGroup({ name: new FormControl('Loaded fixture', { nonNullable: true, validators: Validators.required }) }) });
  readonly messages = { required: 'Required name fixture' };
  count = 0;
}

describe('Shared form and text accessor under zoneless rendering', () => {
  beforeEach(async () => {
    document.cookie = 'i18next=; Path=/; Max-Age=0';
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    await TestBed.inject(LocalizationRuntime).loadNamespace('core');
  });
  afterEach(() => { document.cookie = 'i18next=; Path=/; Max-Age=0'; });

  it('keeps invalid submit enabled, renders each field error and summary link, and focuses the first field', async () => {
    const fixture = TestBed.createComponent(AccessComposition); await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const form = root.querySelector('form')!;
    const submit = root.querySelector<HTMLButtonElement>('button[type=submit]')!;
    expect(form.noValidate).toBe(true); expect(submit.disabled).toBe(false);
    submit.click(); await fixture.whenStable();
    expect(root.querySelectorAll('.error')).toHaveLength(2);
    expect(root.querySelectorAll('.error-summary a')).toHaveLength(2);
    const input = root.querySelector('input')!;
    expect(document.activeElement).toBe(input); expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain('-error');
    const secondLink = root.querySelectorAll<HTMLAnchorElement>('.error-summary a')[1]; secondLink.click();
    expect(document.activeElement).toBe(root.querySelectorAll('input')[1]);
    expect(fixture.componentInstance.count).toBe(0);
  });

  it('propagates model patches/reset/null/disable without echoing a value change and repaints without forced detection', async () => {
    const fixture = TestBed.createComponent(AccessComposition); await fixture.whenStable();
    const control = fixture.componentInstance.form.controls.email;
    const values: unknown[] = []; control.valueChanges.subscribe(value => values.push(value));
    await Promise.resolve(); control.setValue('loaded@example.test'); await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    expect(input.value).toBe('loaded@example.test'); expect(values).toEqual(['loaded@example.test']);
    control.disable(); await fixture.whenStable(); expect(input.disabled).toBe(true);
    control.enable(); control.reset(null); await fixture.whenStable(); expect(input.value).toBe(''); expect(input.disabled).toBe(false);
  });

  it('sends input and clear exactly once, commits IME only at composition end, and marks touched on blur', async () => {
    const fixture = TestBed.createComponent(AccessComposition); await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement; const input = root.querySelector('input')!;
    const control = fixture.componentInstance.form.controls.email;
    const values: unknown[] = []; control.valueChanges.subscribe(value => values.push(value));
    input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    input.value = 'اسم'; input.dispatchEvent(new Event('input', { bubbles: true })); expect(values).toEqual([]);
    input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true })); expect(values).toEqual(['اسم']);
    input.dispatchEvent(new Event('blur')); expect(control.touched).toBe(true); await fixture.whenStable();
    root.querySelector<HTMLButtonElement>('button[aria-label="Clear"]')!.click(); await fixture.whenStable();
    expect(values).toEqual(['اسم', '']); expect(control.value).toBe(''); expect(document.activeElement).toBe(input);
  });

  it('reveals a password without changing its value and does not render clear for read-only input', async () => {
    const fixture = TestBed.createComponent(AccessComposition);
    fixture.componentInstance.form.controls.secret.setValue('fixture secret'); await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement; const input = root.querySelectorAll('input')[1];
    const values: unknown[] = []; fixture.componentInstance.form.controls.secret.valueChanges.subscribe(value => values.push(value));
    root.querySelector<HTMLButtonElement>('button[aria-label="Show password"]')!.click(); await fixture.whenStable();
    expect(input.type).toBe('text'); expect(input.value).toBe('fixture secret'); expect(values).toEqual([]);
    fixture.componentInstance.readonly.set(true); await fixture.whenStable();
    expect(input.readOnly).toBe(true); expect(input.closest('erp-text-field')?.querySelector('button[aria-label="Clear"]')).toBeNull();
    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click(); expect(fixture.componentInstance.count).toBe(0);
  });

  it('maps nested server paths, exposes unmapped errors and clears only a field server error after editing', async () => {
    const fixture = TestBed.createComponent(ProfileComposition); await fixture.whenStable();
    const model = fixture.componentInstance; const control = model.form.controls.profile.controls.name;
    const unmatched = applyServerFieldErrors(model.form, { 'profile.name': 'Duplicate fixture', other: 'Form feedback fixture' });
    await fixture.whenStable(); expect(unmatched).toEqual({ other: 'Form feedback fixture' });
    const root = fixture.nativeElement as HTMLElement; expect(root.querySelector('.error')?.textContent).toBe('Duplicate fixture');
    const input = root.querySelector('input')!; input.value = 'Different'; input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable(); expect(control.errors).toBeNull(); expect(root.querySelector('.error')).toBeNull();
    control.setErrors({ required: true, server: 'Server fixture' }); clearServerFieldError(control);
    expect(control.errors).toEqual({ required: true });
    const array = new FormGroup({ rows: new FormArray([new FormGroup({ name: new FormControl('') })]) });
    expect(applyServerFieldErrors(array, { 'rows[0].name': 'Row fixture' })).toEqual({});
    expect(array.get('rows.0.name')?.errors).toEqual({ server: 'Row fixture' });
  });

  it('emits a valid submission once and blocks subsequent submits while the caller is saving', async () => {
    const fixture = TestBed.createComponent(AccessComposition);
    fixture.componentInstance.form.setValue({ email: 'valid@example.test', secret: 'valid' }); await fixture.whenStable();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await fixture.whenStable();
    expect(fixture.componentInstance.count).toBe(1);
    expect(form.getAttribute('aria-busy')).toBe('true');
    expect(form.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(true);
  });

  it('waits for async validation, blocks duplicate checks, then shows the error and focuses it', async () => {
    const fixture = TestBed.createComponent(ProfileComposition); await fixture.whenStable();
    const control = fixture.componentInstance.form.controls.profile.controls.name;
    let complete: ((value: { server: string } | null) => void) | undefined;
    control.setAsyncValidators(() => new Promise(resolve => { complete = resolve; }));
    control.updateValueAndValidity();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true })); form.dispatchEvent(new Event('submit', { cancelable: true }));
    complete?.({ server: 'Async fixture' }); await fixture.whenStable();
    expect(fixture.componentInstance.count).toBe(0);
    expect(form.querySelector('.error')?.textContent).toBe('Async fixture');
    expect(document.activeElement).toBe(form.querySelector('input'));
  });

  it('observes a replaced control and renders its later server errors', async () => {
    const fixture = TestBed.createComponent(AccessComposition); await fixture.whenStable();
    const replacement = new FormControl<string | null>('replacement@example.test');
    fixture.componentInstance.form.setControl('email', replacement);
    fixture.componentInstance.emailControl.set(replacement); await fixture.whenStable();
    await Promise.resolve(); replacement.setErrors({ server: 'Replaced control fixture' }); replacement.markAsTouched();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.error')?.textContent).toBe('Replaced control fixture');
    expect((fixture.nativeElement as HTMLElement).querySelector('input')?.value).toBe('replacement@example.test');
  });
});

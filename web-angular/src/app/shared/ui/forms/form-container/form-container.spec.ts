import { fixtureItem } from '../../../../../testing/fixture-item';
import { Component, input, model, signal, viewChild, type ElementRef } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidatorFn,
  Validators,
} from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../../theme/public-api';
import { LocalizationRuntime } from '../../../../platform/localization/public-api';
import {
  applyServerFieldErrors,
  clearServerFieldError,
  FormFieldControl,
  FormContainer,
  FormSection,
  TextField,
} from '../public-api';

@Component({
  imports: [ReactiveFormsModule, FormContainer, TextField],
  templateUrl: './form-container.spec.access-composition.html',
})
class AccessComposition {
  readonly form = new FormGroup({
    email: new FormControl<string | null>('', [Validators.required, Validators.email]),
    secret: new FormControl<string | null>('', Validators.required),
  });
  readonly emailControl = signal(this.form.controls.email);
  readonly messages = { required: 'Required fixture', email: 'Invalid email fixture' };
  readonly pending = signal(false);
  readonly readonly = signal(false);
  count = 0;
  submit(): void {
    this.count++;
    this.pending.set(true);
  }
}

@Component({
  imports: [ReactiveFormsModule, FormContainer, TextField],
  templateUrl: './form-container.spec.profile-composition.html',
})
class ProfileComposition {
  readonly form = new FormGroup({
    profile: new FormGroup({
      name: new FormControl('Loaded fixture', {
        nonNullable: true,
        validators: Validators.required,
      }),
    }),
  });
  readonly messages = { required: 'Required name fixture' };
  count = 0;
}

@Component({
  imports: [ReactiveFormsModule, TextField],
  selector: 'boundary-child-fields',
  templateUrl: './form-container.spec.boundary-child.html',
})
class BoundaryChildFields {
  readonly control = input.required<FormControl<string | null>>();
}

@Component({
  imports: [ReactiveFormsModule, FormContainer, FormSection, BoundaryChildFields],
  templateUrl: './form-container.spec.section-composition.html',
})
class SectionComposition {
  readonly form = new FormGroup({
    nested: new FormControl<string | null>('', Validators.required),
  });
  readonly activeSection = signal('identity');
  readonly requestedSections: string[] = [];
  readonly showChild = signal(true);

  selectSection(section: string): void {
    this.requestedSections.push(section);
    this.activeSection.set(section);
  }
}

@Component({
  selector: 'array-value-field',
  imports: [ReactiveFormsModule],
  templateUrl: './form-container.spec.array-value-field.html',
})
class ArrayValueField extends FormFieldControl<readonly string[]> {
  readonly value = model<readonly string[]>([]);
  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');

  writeValue(value: unknown): void {
    this.value.set(
      Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [],
    );
  }

  focus(): void {
    this.button().nativeElement.focus();
  }
}

@Component({
  imports: [ReactiveFormsModule, FormContainer, ArrayValueField],
  templateUrl: './form-container.spec.array-composition.html',
})
class ArrayComposition {
  readonly form = new FormGroup({
    grants: new FormControl<readonly string[]>([], nonEmptyArray),
  });
}

const nonEmptyArray: ValidatorFn = (control) => {
  const value: unknown = control.value;
  return Array.isArray(value) && value.some((item) => typeof item === 'string')
    ? null
    : { required: true };
};

@Component({
  imports: [ReactiveFormsModule, FormContainer, FormSection, BoundaryChildFields],
  templateUrl: './form-container.spec.isolation-composition.html',
})
class IsolationComposition {
  readonly first = new FormGroup({
    value: new FormControl<string | null>('', Validators.required),
  });
  readonly second = new FormGroup({
    value: new FormControl<string | null>('', Validators.required),
  });
}

@Component({
  imports: [ReactiveFormsModule, FormContainer, BoundaryChildFields],
  templateUrl: './form-container.spec.boundary-composition.html',
})
class BoundaryComposition {
  readonly form = new FormGroup({
    nested: new FormControl<string | null>('', Validators.required),
  });
  readonly messages = { required: 'Nested value is required' };
}

describe('Shared form and text accessor under zoneless rendering', () => {
  beforeEach(async () => {
    document.cookie = 'i18next=; Path=/; Max-Age=0';
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    await TestBed.inject(LocalizationRuntime).loadNamespace('core');
  });
  afterEach(() => {
    document.cookie = 'i18next=; Path=/; Max-Age=0';
  });

  it('keeps invalid submit enabled, renders each field error and summary link, and focuses the first field', async () => {
    const fixture = TestBed.createComponent(AccessComposition);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const form = root.querySelector('form')!;
    const submit = root.querySelector<HTMLButtonElement>('button[type=submit]')!;
    expect(form.noValidate).toBe(true);
    expect(submit.disabled).toBe(false);
    submit.click();
    await fixture.whenStable();
    expect(root.querySelectorAll('.error')).toHaveLength(2);
    expect(root.querySelectorAll('.error-summary a')).toHaveLength(2);
    const input = root.querySelector('input')!;
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain('-error');
    const secondLink = fixtureItem(root.querySelectorAll<HTMLAnchorElement>('.error-summary a'), 1);
    secondLink.click();
    expect(document.activeElement).toBe(root.querySelectorAll('input')[1]);
    expect(fixture.componentInstance.count).toBe(0);
  });

  it('includes an invalid shared field projected through a child component in the validation summary', async () => {
    const fixture = TestBed.createComponent(BoundaryComposition);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();

    expect(root.querySelectorAll('.error-summary a')).toHaveLength(1);
    expect(root.querySelector('.error-summary')?.textContent).toContain('Nested field');
  });

  it('requests the child section before focusing an invalid field from a hidden kept-alive panel', async () => {
    const fixture = TestBed.createComponent(SectionComposition);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
    fixture.componentInstance.activeSection.set('identity');
    await fixture.whenStable();

    root.querySelector<HTMLAnchorElement>('.error-summary a')!.click();
    expect(fixture.componentInstance.requestedSections).toEqual(['settings', 'settings']);
    expect(fixture.componentInstance.activeSection()).toBe('settings');
    await fixture.whenStable();
    expect(document.activeElement).toBe(root.querySelector('input'));
  });

  it('removes a destroyed child field from the validation summary', async () => {
    const fixture = TestBed.createComponent(SectionComposition);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
    expect(root.querySelectorAll('.error-summary a')).toHaveLength(1);

    fixture.componentInstance.showChild.set(false);
    await fixture.whenStable();
    expect(root.querySelectorAll('.error-summary a')).toHaveLength(0);
  });

  it('registers a readonly-array custom field through the public base contract', async () => {
    const fixture = TestBed.createComponent(ArrayComposition);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();

    expect(root.querySelector('.error-summary')?.textContent).toContain('Grant choices');
    expect(document.activeElement).toBe(root.querySelector('button[type=button]'));
  });

  it('keeps field registration isolated between separate forms', async () => {
    const fixture = TestBed.createComponent(IsolationComposition);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const forms = root.querySelectorAll('form');

    forms[0]?.querySelector<HTMLButtonElement>('button[type=submit]')?.click();
    await fixture.whenStable();

    expect(forms[0]?.querySelectorAll('.error-summary a')).toHaveLength(1);
    expect(forms[1]?.querySelectorAll('.error-summary a')).toHaveLength(0);
  });

  it('propagates model patches/reset/null/disable without echoing a value change and repaints without forced detection', async () => {
    const fixture = TestBed.createComponent(AccessComposition);
    await fixture.whenStable();
    const control = fixture.componentInstance.form.controls.email;
    const values: unknown[] = [];
    control.valueChanges.subscribe((value) => values.push(value));
    await Promise.resolve();
    control.setValue('loaded@example.test');
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    expect(input.value).toBe('loaded@example.test');
    expect(values).toEqual(['loaded@example.test']);
    control.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    control.enable();
    control.reset(null);
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(input.disabled).toBe(false);
  });

  it('sends input and clear exactly once, commits IME only at composition end, and marks touched on blur', async () => {
    const fixture = TestBed.createComponent(AccessComposition);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input')!;
    const control = fixture.componentInstance.form.controls.email;
    const values: unknown[] = [];
    control.valueChanges.subscribe((value) => values.push(value));
    input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    input.value = 'اسم';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(values).toEqual([]);
    input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(values).toEqual(['اسم']);
    input.dispatchEvent(new Event('blur'));
    expect(control.touched).toBe(true);
    await fixture.whenStable();
    root.querySelector<HTMLButtonElement>('button[aria-label="Clear"]')!.click();
    await fixture.whenStable();
    expect(values).toEqual(['اسم', '']);
    expect(control.value).toBe('');
    expect(document.activeElement).toBe(input);
  });

  it('reveals a password without changing its value and does not render clear for read-only input', async () => {
    const fixture = TestBed.createComponent(AccessComposition);
    fixture.componentInstance.form.controls.secret.setValue('fixture secret');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = fixtureItem(root.querySelectorAll('input'), 1);
    const values: unknown[] = [];
    fixture.componentInstance.form.controls.secret.valueChanges.subscribe((value) =>
      values.push(value),
    );
    root.querySelector<HTMLButtonElement>('button[aria-label="Show password"]')!.click();
    await fixture.whenStable();
    expect(input.type).toBe('text');
    expect(input.value).toBe('fixture secret');
    expect(values).toEqual([]);
    fixture.componentInstance.readonly.set(true);
    await fixture.whenStable();
    expect(input.readOnly).toBe(true);
    expect(input.closest('erp-text-field')?.querySelector('button[aria-label="Clear"]')).toBeNull();
    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    expect(fixture.componentInstance.count).toBe(0);
  });

  it('maps nested server paths, exposes unmapped errors and clears only a field server error after editing', async () => {
    const fixture = TestBed.createComponent(ProfileComposition);
    await fixture.whenStable();
    const model = fixture.componentInstance;
    const control = model.form.controls.profile.controls.name;
    const unmatched = applyServerFieldErrors(model.form, {
      'profile.name': 'Duplicate fixture',
      other: 'Form feedback fixture',
    });
    await fixture.whenStable();
    expect(unmatched).toEqual({ other: 'Form feedback fixture' });
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.error')?.textContent).toBe('Duplicate fixture');
    const input = root.querySelector('input')!;
    input.value = 'Different';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(control.errors).toBeNull();
    expect(root.querySelector('.error')).toBeNull();
    control.setErrors({ required: true, server: 'Server fixture' });
    clearServerFieldError(control);
    expect(control.errors).toEqual({ required: true });
    const array = new FormGroup({
      rows: new FormArray([new FormGroup({ name: new FormControl('') })]),
    });
    expect(applyServerFieldErrors(array, { 'rows[0].name': 'Row fixture' })).toEqual({});
    expect(array.get('rows.0.name')?.errors).toEqual({ server: 'Row fixture' });
  });

  it('emits a valid submission once and blocks subsequent submits while the caller is saving', async () => {
    const fixture = TestBed.createComponent(AccessComposition);
    fixture.componentInstance.form.setValue({ email: 'valid@example.test', secret: 'valid' });
    await fixture.whenStable();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.count).toBe(1);
    expect(form.getAttribute('aria-busy')).toBe('true');
    expect(form.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(true);
  });

  it('waits for async validation, blocks duplicate checks, then shows the error and focuses it', async () => {
    const fixture = TestBed.createComponent(ProfileComposition);
    await fixture.whenStable();
    const control = fixture.componentInstance.form.controls.profile.controls.name;
    let complete: ((value: { server: string } | null) => void) | undefined;
    control.setAsyncValidators(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    control.updateValueAndValidity();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    complete?.({ server: 'Async fixture' });
    await fixture.whenStable();
    expect(fixture.componentInstance.count).toBe(0);
    expect(form.querySelector('.error')?.textContent).toBe('Async fixture');
    expect(document.activeElement).toBe(form.querySelector('input'));
  });

  it('observes a replaced control and renders its later server errors', async () => {
    const fixture = TestBed.createComponent(AccessComposition);
    await fixture.whenStable();
    const replacement = new FormControl<string | null>('replacement@example.test');
    fixture.componentInstance.form.setControl('email', replacement);
    fixture.componentInstance.emailControl.set(replacement);
    await fixture.whenStable();
    await Promise.resolve();
    replacement.setErrors({ server: 'Replaced control fixture' });
    replacement.markAsTouched();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.error')?.textContent).toBe(
      'Replaced control fixture',
    );
    expect((fixture.nativeElement as HTMLElement).querySelector('input')?.value).toBe(
      'replacement@example.test',
    );
  });
});

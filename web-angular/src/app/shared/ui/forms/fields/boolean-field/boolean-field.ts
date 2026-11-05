import {
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  type OnDestroy,
  model,
} from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  ReactiveFormsModule,
  type ValidatorFn,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Checkbox } from 'primeng/checkbox';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormFieldControl } from '../../form-field-control';

@Component({
  selector: 'erp-boolean-field',
  imports: [ReactiveFormsModule, Checkbox, ToggleSwitch],
  providers: [{ provide: FormFieldControl, useExisting: forwardRef(() => BooleanField) }],
  templateUrl: './boolean-field.html',
  styleUrl: './boolean-field.scss',
})
export class BooleanField extends FormFieldControl<boolean> implements OnDestroy {
  readonly kind = input<'checkbox' | 'switch'>('checkbox');
  readonly value = model(false);
  readonly control = new FormControl(false, { nonNullable: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private owner: AbstractControl | null = null;
  private readonly validator: ValidatorFn = (control) =>
    typeof control.value === 'boolean' ? null : { booleanValue: true };
  readonly attributes = computed(() => ({
    input: {
      'aria-describedby': this.describedBy(),
      'aria-invalid': this.error() ? 'true' : null,
      'aria-readonly': this.isReadOnly() ? 'true' : null,
      'aria-required': this.required() ? 'true' : null,
    },
  }));
  readonly switchTokens = {
    root: {
      width: '3rem',
      height: '1.75rem',
      gap: '0.25rem',
      background: '{form.field.border.color}',
      hoverBackground: '{form.field.hover.border.color}',
      checkedBackground: '{primary.color}',
      checkedHoverBackground: '{primary.color}',
      borderColor: '{form.field.border.color}',
    },
    handle: {
      size: '1.125rem',
      background: '{content.background}',
      checkedBackground: '{primary.contrast.color}',
      checkedHoverBackground: '{primary.contrast.color}',
    },
  };
  constructor() {
    super();
    effect(() => {
      this.control.setValue(this.value(), { emitEvent: false });
      if (this.isDisabled()) this.control.disable({ emitEvent: false });
      else this.control.enable({ emitEvent: false });
    });
    this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => this.choose(value));
  }
  override ngDoCheck() {
    super.ngDoCheck();
    const control = this.legacyControl();
    if (control === this.owner) return;
    this.detach();
    this.owner = control;
    if (control) {
      const server: unknown = control.errors?.['server'];
      control.addValidators(this.validator);
      control.updateValueAndValidity({ emitEvent: false });
      if (server !== undefined)
        control.setErrors({ ...control.errors, server }, { emitEvent: false });
      this.validationChanged();
    }
  }
  writeValue(value: unknown) {
    this.value.set(value === true);
  }
  focus() {
    this.host.nativeElement.querySelector<HTMLInputElement>('input')?.focus();
  }
  choose(value: unknown) {
    if (typeof value === 'boolean') this.accept(value);
    this.control.setValue(this.value(), { emitEvent: false });
  }
  /** Native checkbox activation ignores readonly; cancel its default while retaining focusability. */
  protectActivation(event: Event) {
    if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key)) return;
    if (this.isReadOnly() || this.isDisabled()) event.preventDefault();
  }
  override error() {
    const error = super.error(),
      control = this.legacyControl();
    return error &&
      control?.errors?.['booleanValue'] &&
      !control.errors['server'] &&
      !this.messages()['booleanValue']
      ? this.runtime.translate('booleanField.invalid')
      : error;
  }
  ngOnDestroy() {
    this.detach();
  }
  private detach() {
    if (this.owner) {
      this.owner.removeValidators(this.validator);
      this.owner.updateValueAndValidity({ emitEvent: false });
      this.owner = null;
    }
  }
}

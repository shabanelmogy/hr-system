import {
  booleanAttribute,
  ChangeDetectorRef,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  signal,
  type DoCheck,
  type ModelSignal,
} from '@angular/core';
import { AbstractControl, NgControl, type ControlValueAccessor } from '@angular/forms';
import { FormField, type FormValueControl, type ValidationError } from '@angular/forms/signals';
import type { Subscription } from 'rxjs';
import { UI_LOCALIZATION } from '../../localization/public-api';
import { clearServerFieldError, type FieldMessages } from './form-errors';
import { FormFieldRegistry } from './form-field-registry';
import { FORM_SECTION } from './form-section';

let sequence = 0;
/** Internal query token and common form lifecycle for every shared data-entry field. */
@Directive()
export abstract class FormFieldControl<T>
  implements FormValueControl<T>, ControlValueAccessor, DoCheck
{
  readonly label = input.required<string>();
  readonly name = input('');
  readonly help = input('');
  readonly messages = input<FieldMessages>({});
  readonly required = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly id = `erp-field-${++sequence}`;
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly touched = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly touch = output<void>();
  private readonly legacyDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.legacyDisabled());
  readonly isReadOnly = computed(() => this.readOnly() || this.readonly());
  abstract readonly value: ModelSignal<T>;
  readonly ngControl = inject(NgControl, { self: true, optional: true });
  protected readonly runtime = inject(UI_LOCALIZATION);
  private readonly signalBinding = inject(FormField, { self: true, optional: true });
  private readonly registry = inject(FormFieldRegistry, { optional: true });
  private readonly section = inject(FORM_SECTION, { optional: true });
  private readonly fieldHost = inject(ElementRef<HTMLElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly revision = signal(0);
  private observedControl: AbstractControl | null = null;
  private subscription: Subscription | undefined;
  private changed: (value: T) => void = () => {};
  private touchedCallback: () => void = () => {};
  constructor() {
    if (this.ngControl && !this.signalBinding) this.ngControl.valueAccessor = this;
    const unregister = this.registry?.register(this, this.fieldHost.nativeElement as HTMLElement);
    inject(DestroyRef).onDestroy(() => {
      this.subscription?.unsubscribe();
      unregister?.();
    });
  }
  abstract writeValue(value: unknown): void;
  abstract focus(): void;
  sectionId(): string | null {
    const id = this.section?.id().trim();
    return id || null;
  }
  registerOnChange(callback: (value: T) => void) {
    this.changed = callback;
  }
  registerOnTouched(callback: () => void) {
    this.touchedCallback = callback;
  }
  setDisabledState(disabled: boolean) {
    this.legacyDisabled.set(disabled);
  }
  protected legacyControl(): AbstractControl | null {
    const control = this.ngControl?.control;
    return control instanceof AbstractControl ? control : null;
  }
  ngDoCheck() {
    const control = this.legacyControl();
    if (control === this.observedControl) return;
    this.subscription?.unsubscribe();
    this.observedControl = control;
    this.subscription = control?.events.subscribe(() => {
      this.revision.update((value) => value + 1);
      this.cdr.markForCheck();
    });
  }
  error(): string | null {
    this.revision();
    const control = this.legacyControl();
    if (!control) {
      if (!this.touched()) return null;
      const first = this.errors().find((error) => error.kind === 'server') ?? this.errors()[0];
      if (!first) return null;
      const message = this.messages()[first.kind];
      return (
        first.message ??
        (typeof message === 'function' ? message(first) : message) ??
        this.runtime.translate('common.validationErrors')
      );
    }
    if (!control.invalid || !control.touched) return null;
    const server: unknown = control.errors?.['server'];
    if (typeof server === 'string') return server;
    const first = Object.entries(control.errors ?? {})[0];
    if (!first) return null;
    const message = this.messages()[first[0]];
    return typeof message === 'function'
      ? message(first[1])
      : (message ?? this.runtime.translate('common.validationErrors'));
  }
  describedBy(): string | null {
    return (
      [this.help() ? this.id + '-help' : '', this.error() ? this.id + '-error' : '']
        .filter(Boolean)
        .join(' ') || null
    );
  }
  blur() {
    this.touchedCallback();
    this.touch.emit();
  }
  /** Re-evaluate shared error summaries when a constraint changes without a value event. */
  protected validationChanged() {
    this.revision.update((value) => value + 1);
    this.cdr.markForCheck();
  }
  protected accept(value: T) {
    if (this.isDisabled() || this.isReadOnly() || Object.is(value, this.value())) return;
    clearServerFieldError(this.legacyControl());
    this.value.set(value);
    this.changed(value);
  }
}

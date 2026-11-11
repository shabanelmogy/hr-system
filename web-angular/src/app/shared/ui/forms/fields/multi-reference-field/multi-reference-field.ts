import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MultiSelect } from 'primeng/multiselect';
import { FormFieldControl } from '../../form-field-control';
import {
  referenceOptionAttributes,
  validReferenceId,
  type ReferenceId,
  type ReferenceOption,
} from '../reference.types';

@Component({
  imports: [ReactiveFormsModule, MultiSelect],
  providers: [{ provide: FormFieldControl, useExisting: forwardRef(() => MultiReferenceField) }],
  selector: 'erp-multi-reference-field',
  styleUrl: './multi-reference-field.scss',
  templateUrl: './multi-reference-field.html',
})
export class MultiReferenceField extends FormFieldControl<readonly ReferenceId[]> {
  readonly value = model<readonly ReferenceId[]>([]);
  readonly options = input.required<readonly ReferenceOption[]>();
  readonly filter = input(true, { transform: booleanAttribute });
  readonly clearable = input(true, { transform: booleanAttribute });
  readonly placeholder = input('');
  readonly searchLabel = computed(() => this.runtime.translate('general.search'));
  readonly control = new FormControl<ReferenceId[]>([], { nonNullable: true });
  private readonly select = viewChild(MultiSelect);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly displayOptions = computed(() => {
    const available = this.options().filter(
      (option) => validReferenceId(option.value) && !!option.label.trim(),
    );
    const known = new Set(available.map((option) => key(option.value)));
    const retained = this.value()
      .filter((value) => !known.has(key(value)))
      .map((value) => ({
        value,
        label: this.runtime.translate('reference.unavailable'),
        disabled: true,
      }));
    return [...retained, ...available];
  });
  readonly attributes = computed(() => ({
    root: {
      class: 'erp-multi-reference-select',
      'aria-describedby': this.describedBy(),
      'aria-invalid': this.error() ? 'true' : null,
    },
    overlay: { class: 'erp-multi-reference-overlay' },
    option: referenceOptionAttributes,
  }));
  constructor() {
    super();
    // MultiSelect exposes PT for its root but not its keyboard input. Associate
    // shared field feedback with the focusable combobox after vendor rendering.
    afterRenderEffect(() => {
      const description = this.describedBy();
      const invalid = !!this.error();
      const readonly = this.isReadOnly();
      const required = this.required();
      const input = this.host.nativeElement.querySelector<HTMLInputElement>('[role=combobox]');
      if (!input) return;
      if (description) input.setAttribute('aria-describedby', description);
      else input.removeAttribute('aria-describedby');
      input.setAttribute('aria-invalid', String(invalid));
      input.setAttribute('aria-readonly', String(readonly));
      input.setAttribute('aria-required', String(required));
    });
    effect(() => {
      this.control.setValue([...this.value()], { emitEvent: false });
      if (this.isDisabled()) this.control.disable({ emitEvent: false });
      else this.control.enable({ emitEvent: false });
      if (this.isDisabled() || this.isReadOnly()) this.select()?.hide(true);
    });
    this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => this.choose(value));
  }
  writeValue(value: unknown): void {
    this.value.set(normalize(value));
  }
  focus(): void {
    this.host.nativeElement.querySelector<HTMLElement>('[role=combobox]')?.focus();
  }
  protectSelection(event: Event): void {
    // PrimeNG's chip Enter handler removes the item but leaves native form submission enabled.
    if (event instanceof KeyboardEvent && event.key === 'Enter') event.preventDefault();
  }
  choose(value: unknown): void {
    const next = normalize(value);
    const allowed = new Set(
      this.options()
        .filter((option) => !option.disabled)
        .map((option) => key(option.value)),
    );
    const retained = new Set(this.value().map((id) => key(id)));
    if (
      !this.isDisabled() &&
      !this.isReadOnly() &&
      next.every((id) => allowed.has(key(id)) || retained.has(key(id)))
    )
      this.accept(next);
    this.control.setValue([...this.value()], { emitEvent: false });
  }
}
function key(value: ReferenceId): string {
  return `${typeof value}:${value}`;
}
function normalize(value: unknown): readonly ReferenceId[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.filter(validReferenceId).filter((id) => !seen.has(key(id)) && !!seen.add(key(id)));
}

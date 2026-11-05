import {
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  untracked,
  viewChild,
  type OnDestroy,
} from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  ReactiveFormsModule,
  type ValidatorFn,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';
import { Times } from '@primeicons/angular/times';
import { UiTextPipe } from '../../../../localization/public-api';
import { CalendarLocale } from '../../../../../../theme/calendar-public-api';
import { PopoverPanel } from '../../../overlays/popover-panel/popover-panel';
import { FormFieldControl } from '../../form-field-control';
import { TextField } from '../text-field/text-field';
import {
  dateOnlyErrors,
  dateOnlyToLocal,
  firstDateOnly,
  lastDateOnly,
  localToDateOnly,
  normalizeDateDigits,
} from '../date-only';

@Component({
  selector: 'erp-date-field',
  imports: [
    InputText,
    ButtonDirective,
    UiTextPipe,
    PopoverPanel,
    DatePicker,
    ReactiveFormsModule,
    Times,
  ],
  providers: [{ provide: FormFieldControl, useExisting: forwardRef(() => DateField) }],
  templateUrl: './date-field.html',
  styleUrl: '../text-field/text-field.scss',
})
export class DateField extends TextField implements OnDestroy {
  readonly min = input(firstDateOnly, {
    transform: (value: string | undefined) => value ?? firstDateOnly,
  });
  readonly max = input(lastDateOnly, {
    transform: (value: string | undefined) => value ?? lastDateOnly,
  });
  private readonly calendar = viewChild<PopoverPanel>('calendar');
  private owner: AbstractControl | null = null;
  private readonly validator: ValidatorFn = (control) =>
    dateOnlyErrors(control.value, this.min(), this.max());
  readonly boundsInvalid = computed(() => dateOnlyErrors('', this.min(), this.max()) !== null);
  // PrimeNG's Date constructors map years0..99 to1900..1999; keep those days manual.
  readonly manualOnly = computed(
    () =>
      this.max() < '0100-01-01' ||
      (this.value() !== '' && !dateOnlyErrors(this.value()) && this.value() < '0100-01-01'),
  );
  readonly calendarControl = new FormControl<Date | null>(null);
  readonly calendarMin = computed(
    () => dateOnlyToLocal(this.min() < '0100-01-01' ? '0100-01-01' : this.min()) ?? undefined,
  );
  readonly calendarMax = computed(() => dateOnlyToLocal(this.max()) ?? undefined);
  readonly calendarAttributes = {
    panel: {
      style: {
        padding: '0',
        border: '0',
        boxShadow: 'none',
        background: 'transparent',
        width: '100%',
      },
    },
  };
  readonly calendarTokens = {
    date: { width: '2.5rem', height: '2.5rem' },
    panel: { padding: '0' },
    colorScheme: {
      light: {
        date: { selectedBackground: '{primary.color}', selectedColor: '{primary.contrast.color}' },
      },
      dark: {
        date: { selectedBackground: '{primary.color}', selectedColor: '{primary.contrast.color}' },
      },
    },
  };
  constructor() {
    super();
    inject(CalendarLocale);
    effect(() => {
      this.min();
      this.max();
      untracked(() => {
        this.owner?.updateValueAndValidity();
        this.calendar()?.close();
      });
    });
    effect(() => {
      if (this.isDisabled() || this.isReadOnly()) untracked(() => this.calendar()?.close());
    });
    effect(() => {
      this.calendarControl.setValue(dateOnlyToLocal(this.value()), { emitEvent: false });
      if (this.isDisabled() || this.isReadOnly() || this.boundsInvalid())
        this.calendarControl.disable({ emitEvent: false });
      else this.calendarControl.enable({ emitEvent: false });
    });
    this.calendarControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.choose(value));
  }
  override ngDoCheck() {
    super.ngDoCheck();
    const control = this.legacyControl();
    if (control === this.owner) return;
    this.detach();
    this.owner = control;
    if (control) {
      control.addValidators(this.validator);
      control.updateValueAndValidity();
    }
  }
  override writeValue(value: unknown) {
    super.writeValue(value);
    this.calendar()?.close();
  }
  override reset() {
    super.reset();
    this.calendar()?.close();
  }
  override describedBy() {
    return (
      [
        this.help() ? this.id + '-help' : '',
        this.error() ? this.id + '-error' : '',
        this.manualOnly() ? this.id + '-calendar-help' : '',
      ]
        .filter(Boolean)
        .join(' ') || null
    );
  }
  override onInput(event: Event) {
    if (event.target instanceof HTMLInputElement && !this.composing)
      event.target.value = normalizeDateDigits(event.target.value);
    super.onInput(event);
  }
  override clear() {
    if (this.isDisabled() || this.isReadOnly()) return;
    super.clear();
    this.calendar()?.close();
  }
  override error(): string | null {
    const error = super.error(),
      control = this.legacyControl();
    if (!error) return error;
    if (control?.errors?.['server'] || this.errors().some((error) => error.kind === 'server'))
      return error;
    const key = control ? Object.keys(control.errors ?? {})[0] : this.errors()[0]?.kind;
    if (!key || this.messages()[key]) return error;
    if (key === 'dateOnly') return this.runtime.translate('validation.invalidDate');
    if (key === 'dateBounds') return this.runtime.translate('dateField.invalidBounds');
    if (key === 'dateRange')
      return this.runtime.translate('dateField.outOfRange', 'core', {
        min: this.min(),
        max: this.max(),
      });
    return error;
  }
  choose(value: unknown) {
    const date = localToDateOnly(value);
    if (
      date === null ||
      this.isDisabled() ||
      this.isReadOnly() ||
      this.manualOnly() ||
      date < '0100-01-01' ||
      dateOnlyErrors(date, this.min(), this.max())
    )
      return;
    this.accept(date);
    this.blur();
    this.calendar()?.close();
  }
  dismiss(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.calendar()?.close();
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

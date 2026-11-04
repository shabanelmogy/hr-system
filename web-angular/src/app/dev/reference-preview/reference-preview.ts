import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { themePaletteOrder } from '@app/tokens';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import { ThemeService } from '../../../theme/public-api';
import {
  ActionButton,
  applyServerFieldErrors,
  FormContainer,
  OptionSelect,
  PageHeader,
  ReferenceField,
  TextField,
  type ReferenceId,
  type ReferenceOption,
  type ReferenceSelection,
  type ReferenceSource,
} from '../../shared/ui/public-api';

type Scenario = 'ready' | 'error' | 'forbidden' | 'empty' | 'loading' | 'missing' | 'archived';
@Component({
  imports: [
    ReactiveFormsModule,
    ActionButton,
    FormContainer,
    OptionSelect,
    PageHeader,
    ReferenceField,
    TextField,
    UiTextPipe,
  ],
  templateUrl: './reference-preview.html',
  styleUrl: './reference-preview.scss',
})
export class ReferencePreview {
  readonly runtime = inject(LocalizationRuntime);
  readonly theme = inject(ThemeService);
  readonly palettes = themePaletteOrder;
  readonly parent = signal('A');
  readonly parents = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
  ];
  readonly search = signal('');
  readonly readonly = signal(false);
  readonly scenario = signal<Scenario>('ready');
  readonly form = new FormGroup({
    reference: new FormControl<ReferenceId | null>(91, Validators.required),
    finite: new FormControl<ReferenceId | null>('0', Validators.required),
    name: new FormControl('', Validators.required),
  });
  readonly source = signal<ReferenceSource>({
    query: { scopeKey: 'A', search: '' },
    kind: 'loading',
  });
  readonly selection = signal<ReferenceSelection | null>({
    scopeKey: 'A',
    value: 91,
    kind: 'ready',
    option: { value: 91, label: 'A · 91' },
  });
  readonly messages = computed(() => ({
    required: this.runtime.translate('validation.required'),
    unavailable: this.runtime.translate('reference.unavailable'),
  }));
  readonly finite = computed<ReferenceSource>(() => {
    const query = { scopeKey: 'finite', search: '' };
    return {
      query,
      kind: 'ready',
      result: {
        query,
        options: [
          { value: '0', label: '0 · A' },
          { value: '1', label: '1 · B' },
          {
            value: 'long',
            label:
              this.runtime.language() === 'ar'
                ? 'مرجع تجريبي طويل للاختبار فقط · '.repeat(5)
                : 'Long technical fixture label · '.repeat(5),
          },
        ],
        hasMore: false,
      },
    };
  });
  readonly scenarios: readonly { value: Scenario; label: string }[] = [
    { value: 'ready', label: 'common.all' },
    { value: 'error', label: 'common.error' },
    { value: 'forbidden', label: 'authorization.forbidden.title' },
    { value: 'empty', label: 'common.noOptionsFound' },
    { value: 'loading', label: 'common.loading' },
    { value: 'missing', label: 'reference.unavailable' },
    { value: 'archived', label: 'actions.archive' },
  ];
  readonly requests = signal(0);
  readonly saved = signal(0);
  readonly increment = (value: number) => value + 1;
  private generation = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private debounce: ReturnType<typeof setTimeout> | undefined;
  constructor() {
    void this.runtime.loadNamespace('core');
    this.request();
    inject(DestroyRef).onDestroy(() => {
      this.generation++;
      clearTimeout(this.timer);
      clearTimeout(this.debounce);
    });
  }
  typeofId() {
    return typeof this.form.controls.reference.value;
  }
  changeParent(value: string) {
    if (value !== 'A' && value !== 'B') return;
    this.parent.set(value);
    this.form.controls.reference.reset(null);
    this.selection.set(null);
    this.search.set('');
    clearTimeout(this.debounce);
    this.request();
  }
  searchFor(value: string) {
    this.search.set(value);
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => this.request(), 180);
  }
  changeScenario(value: Scenario) {
    this.scenario.set(value);
    this.request();
    if (value === 'missing' || value === 'archived') this.patch();
  }
  retry() {
    this.scenario.set('ready');
    this.request();
  }
  request(append = false) {
    const generation = ++this.generation;
    clearTimeout(this.timer);
    this.requests.update((value) => value + 1);
    const query = { scopeKey: this.parent(), search: this.search() },
      scenario = this.scenario();
    const previous =
      append &&
      this.source().kind === 'ready' &&
      this.source().result?.query.scopeKey === query.scopeKey &&
      this.source().result?.query.search === query.search
        ? [...this.source().result!.options]
        : [];
    this.source.update((source) => ({ ...source, query, kind: 'loading' }));
    if (scenario === 'loading') return;
    this.timer = setTimeout(() => {
      if (generation !== this.generation) return;
      if (scenario === 'error' || scenario === 'forbidden') {
        this.source.set({ query, kind: scenario });
        return;
      }
      const all: ReferenceOption[] = Array.from({ length: 23 }, (_, i) => ({
        value: i,
        label: query.scopeKey + ' · ' + String(i).padStart(2, '0'),
        disabled: i === 2,
      })).filter(
        (option) =>
          scenario !== 'empty' &&
          option.label.toLowerCase().includes(query.search.trim().toLowerCase()),
      );
      const options = all.slice(0, previous.length + 5);
      this.source.set({
        query,
        kind: 'ready',
        result: { query, options, hasMore: options.length < all.length },
      });
    }, 250);
  }
  reset() {
    this.readonly.set(false);
    this.form.enable();
    this.form.reset({ reference: null, finite: null, name: '' });
    this.selection.set(null);
    this.search.set('');
    clearTimeout(this.debounce);
    this.scenario.set('ready');
    this.request();
  }
  patch() {
    const scopeKey = this.parent();
    const missing = this.scenario() === 'missing',
      archived = this.scenario() === 'archived';
    this.form.controls.reference.setValue(91);
    this.selection.set({
      scopeKey,
      value: 91,
      kind: missing ? 'missing' : 'ready',
      ...(missing
        ? {}
        : {
            option: {
              value: 91,
              label: scopeKey + ' · 91',
              disabled: archived,
              ...(archived ? { description: this.runtime.translate('actions.archive') } : {}),
            },
          }),
    });
    if (missing) this.form.controls.reference.setErrors({ unavailable: true });
  }
  toggleDisabled() {
    const control = this.form.controls.reference;
    if (control.disabled) control.enable();
    else control.disable();
  }
  serverError() {
    applyServerFieldErrors(this.form, { reference: this.runtime.translate('validation.required') });
  }
}

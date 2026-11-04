import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Checkbox } from 'primeng/checkbox';
import { TabsModule } from 'primeng/tabs';
import { SelectButton } from 'primeng/selectbutton';
import { LocalizationRuntime, UiTextPipe } from '../../../../platform/localization/public-api';
import { ActionButton } from '../../buttons/public-api';
import { AppIcon } from '../../icons/app-icon/app-icon';
import { TextField } from '../../forms/public-api';
import { OptionSelect } from '../../controls/option-select/option-select';
import { DialogPanel } from '../../dialogs/dialog-panel/dialog-panel';
import { CollectionFooter } from '../collection-footer/collection-footer';
import type { CollectionController } from '../collection-controller';
import {
  collectionPageSizes,
  type CollectionColumn,
  type CollectionDensity,
  type CollectionSearch,
  type CollectionSearchChange,
  type CollectionToolbarLayout,
} from '../collection.types';
@Component({
  selector: 'erp-collection-frame',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    FormsModule,
    Checkbox,
    TabsModule,
    SelectButton,
    ActionButton,
    AppIcon,
    TextField,
    OptionSelect,
    DialogPanel,
    CollectionFooter,
    UiTextPipe,
  ],
  templateUrl: './collection-frame.html',
  styleUrls: [
    './collection-frame.scss',
    '../collection-options.scss',
    './collection-frame.component.scss',
  ],
})
export class CollectionFrame<T> {
  private static sequence = 0;
  readonly id = 'erp-grid-options-' + ++CollectionFrame.sequence;
  readonly label = input.required<string>();
  readonly controller = input.required<CollectionController<T>>();
  readonly search = input<CollectionSearch>();
  readonly pageSizes = input<readonly number[]>(collectionPageSizes);
  readonly selectionEnabled = input(false);
  readonly columns = input<readonly CollectionColumn<T>[]>([]);
  readonly visibleColumns = input<readonly string[]>([]);
  readonly density = input<CollectionDensity>('standard');
  readonly toolbarVisible = input(true);
  readonly appearance = input<'standard' | 'reference' | 'plain'>('standard');
  readonly toolbarLayout = input<CollectionToolbarLayout>('responsive');
  readonly recordNavigation = input(false);
  readonly showFooter = input(true);
  readonly searchMaxWidth = input<number | null>(null);
  readonly optionsOpen = signal(false);
  readonly columnSearch = signal('');
  readonly optionColumns = computed(() => {
    const search = this.columnSearch()
      .trim()
      .normalize('NFKC')
      .toLocaleLowerCase(this.locale.language());
    return this.columns().filter((column) =>
      column.header.normalize('NFKC').toLocaleLowerCase(this.locale.language()).includes(search),
    );
  });
  readonly pageSelection = input(true);
  readonly columnTools = input(false);
  readonly pinnedColumns = input<Readonly<Record<string, 'start' | 'end'>>>({});
  readonly columnMove = output<{ readonly key: string; readonly direction: -1 | 1 }>();
  readonly columnPin = output<{ readonly key: string; readonly side: 'start' | 'end' | null }>();
  readonly pinOptions = computed(() => [
    { value: 'none', label: this.locale.translate('collections.unpin') },
    { value: 'start', label: this.locale.translate('collections.pinStart') },
    { value: 'end', label: this.locale.translate('collections.pinEnd') },
  ]);
  readonly searchChange = output<CollectionSearchChange>();
  readonly columnsChange = output<readonly string[]>();
  readonly densityChange = output<CollectionDensity>();
  readonly displayReset = output<void>();
  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly locale = inject(LocalizationRuntime);
  readonly densities = computed(() =>
    ['compact', 'standard', 'comfortable'].map((value) => ({
      value,
      label: this.locale.translate('collections.' + value),
    })),
  );
  private lastOwnerValue: string | null = null;
  private synchronizing = false;
  readonly searchLimit = computed(() => {
    const value = this.search()?.maxLength;
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
  });
  readonly searchMessages = computed(() => ({
    maxlength: this.locale.translate(
      'validation.maxLength',
      'core',
      this.searchLimit() === null ? {} : { count: this.searchLimit() ?? 0 },
    ),
  }));
  constructor() {
    effect(() => {
      const value = this.search()?.value ?? '',
        limit = this.searchLimit();
      this.synchronizing = true;
      try {
        if (value !== this.lastOwnerValue) {
          this.lastOwnerValue = value;
          this.searchControl.setValue(value, { emitEvent: false });
        }
        this.searchControl.setValidators(limit === null ? null : Validators.maxLength(limit));
        this.searchControl.updateValueAndValidity();
      } finally {
        this.synchronizing = false;
      }
    });
    this.searchControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (!this.synchronizing && this.searchControl.valid) this.searchChange.emit({ value });
    });
  }
  changeDensity(value: string) {
    if (value === 'compact' || value === 'standard' || value === 'comfortable')
      this.densityChange.emit(value);
  }
  resetOptions() {
    this.columnSearch.set('');
    this.displayReset.emit();
  }
  pin(key: string, value: string) {
    if (
      this.columnTools() &&
      this.columns().some((column) => column.key === key) &&
      (value === 'start' || value === 'end' || value === 'none')
    )
      this.columnPin.emit({ key, side: value === 'none' ? null : value });
  }
  toggleColumn(key: string, checked: unknown) {
    const column = this.columns().find((c) => c.key === key);
    if (!column || column.hideable === false || typeof checked !== 'boolean') return;
    const values = new Set(this.visibleColumns());
    if (checked) values.add(key);
    else if (values.size > 1) values.delete(key);
    this.columnsChange.emit([...values]);
  }
}

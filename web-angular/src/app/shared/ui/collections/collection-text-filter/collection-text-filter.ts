import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { UI_LOCALIZATION, UiTextPipe } from '../../../localization/public-api';
import { PopoverPanel } from '../../overlays/popover-panel/popover-panel';
import { OptionSelect } from '../../controls/option-select/option-select';
import { TextField } from '../../forms/public-api';
import { ActionButton } from '../../buttons/public-api';
import { AppIcon } from '../../icons/app-icon/app-icon';
import {
  localTextOperators,
  parseLocalTextFilter,
  localTextListLimit,
  localTextValueLimit,
  type LocalTextFilter,
  type LocalTextColumn,
} from '../local-text-filter';

@Component({
  imports: [PopoverPanel, OptionSelect, TextField, ActionButton, AppIcon, UiTextPipe],
  selector: 'erp-collection-text-filter',
  styleUrl: './collection-text-filter.scss',
  templateUrl: './collection-text-filter.html',
})
export class CollectionTextFilter {
  readonly columns = input.required<readonly LocalTextColumn[]>();
  readonly filter = input<LocalTextFilter | null>(null);
  readonly filterChange = output<LocalTextFilter | null>();
  readonly operators = localTextOperators;
  readonly valueLimit = localTextValueLimit;
  readonly listLimit = localTextListLimit;
  private readonly locale = inject(UI_LOCALIZATION);
  private readonly panel = viewChild.required(PopoverPanel);
  private sequence = 0;
  readonly invalid = signal(false);
  readonly choices = computed(() =>
    this.columns().map((column) => ({ value: column.field, label: column.label })),
  );
  readonly operatorChoices = computed(() =>
    this.operators.map((value) => ({
      value,
      label: this.locale.translate('collections.' + value),
    })),
  );
  readonly draft = linkedSignal(() => {
    const filter = this.filter();
    return {
      field: filter?.field ?? this.columns()[0]?.field ?? '',
      operator: filter?.operator ?? 'contains',
      values: (filter?.values.length ? filter.values : ['']).map((value) => ({
        key: ++this.sequence,
        value,
      })),
    };
  });
  readonly unary = computed(() => ['isEmpty', 'isNotEmpty'].includes(this.draft().operator));
  chooseField(field: string): void {
    if (this.columns().some((column) => column.field === field))
      this.draft.update((draft) => ({ ...draft, field }));
  }
  chooseOperator(value: string): void {
    const operator = this.operators.find((operator) => operator === value);
    if (!operator) return;
    this.draft.update((draft) => ({
      ...draft,
      operator,
      values: operator === 'isAnyOf' ? draft.values : draft.values.slice(0, 1),
    }));
  }
  changeValue(key: number, value: string): void {
    this.draft.update((draft) => ({
      ...draft,
      values: draft.values.map((entry) => (entry.key === key ? { ...entry, value } : entry)),
    }));
  }
  addValue(): void {
    if (this.draft().values.length < this.listLimit)
      this.draft.update((draft) => ({
        ...draft,
        values: [...draft.values, { key: ++this.sequence, value: '' }],
      }));
  }
  removeValue(key: number): void {
    this.draft.update((draft) => ({
      ...draft,
      values:
        draft.values.length > 1
          ? draft.values.filter((entry) => entry.key !== key)
          : [{ key, value: '' }],
    }));
  }
  apply(): void {
    try {
      const draft = this.draft();
      const filter = parseLocalTextFilter(
        { ...draft, values: draft.values.map((entry) => entry.value) },
        this.columns().map((column) => column.field),
      );
      this.invalid.set(false);
      this.filterChange.emit(filter);
      this.panel().close();
    } catch {
      this.invalid.set(true);
    }
  }
  clear(): void {
    this.invalid.set(false);
    this.filterChange.emit(null);
    this.panel().close();
  }
}

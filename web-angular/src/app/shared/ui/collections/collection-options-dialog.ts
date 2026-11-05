import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { TabsModule } from 'primeng/tabs';
import { SelectButton } from 'primeng/selectbutton';
import { UI_LOCALIZATION, UiTextPipe } from '../../localization/public-api';
import { ActionButton } from '../buttons/public-api';
import { AppIcon } from '../icons/app-icon';
import { TextField } from '../forms/public-api';
import { OptionSelect } from '../controls/option-select';
import { DialogPanel } from '../dialogs/dialog-panel';
import type { CollectionColumn, CollectionDensity } from './collection.types';

@Component({
  imports: [FormsModule, Checkbox, TabsModule, SelectButton, ActionButton, AppIcon, TextField, OptionSelect, DialogPanel, UiTextPipe],
  selector: 'erp-collection-options-dialog',
  styleUrl: './collection-options-dialog.scss',
  templateUrl: './collection-options-dialog.html',
})
export class CollectionOptionsDialog<T> {
  private static sequence = 0;
  readonly id = 'erp-grid-options-' + ++CollectionOptionsDialog.sequence;
  readonly open = input(false);
  readonly columns = input<readonly CollectionColumn<T>[]>([]);
  readonly visibleColumns = input<readonly string[]>([]);
  readonly density = input<CollectionDensity>('standard');
  readonly columnTools = input(false);
  readonly pinnedColumns = input<Readonly<Record<string, 'start' | 'end'>>>({});
  readonly closed = output<void>();
  readonly columnsChange = output<readonly string[]>();
  readonly densityChange = output<CollectionDensity>();
  readonly displayReset = output<void>();
  readonly columnMove = output<{ readonly key: string; readonly direction: -1 | 1 }>();
  readonly columnPin = output<{ readonly key: string; readonly side: 'start' | 'end' | null }>();
  readonly columnSearch = signal('');
  private readonly locale = inject(UI_LOCALIZATION);
  readonly optionColumns = computed(() => {
    const search = this.columnSearch().trim().normalize('NFKC').toLocaleLowerCase(this.locale.language());
    return this.columns().filter(column => column.header.normalize('NFKC').toLocaleLowerCase(this.locale.language()).includes(search));
  });
  readonly densities = computed(() => ['compact', 'standard', 'comfortable'].map(value => ({ value, label: this.locale.translate('collections.' + value) })));
  readonly pinOptions = computed(() => [
    { value: 'none', label: this.locale.translate('collections.unpin') },
    { value: 'start', label: this.locale.translate('collections.pinStart') },
    { value: 'end', label: this.locale.translate('collections.pinEnd') },
  ]);

  changeDensity(value: string): void {
    if (value === 'compact' || value === 'standard' || value === 'comfortable') this.densityChange.emit(value);
  }

  resetOptions(): void {
    this.columnSearch.set('');
    this.displayReset.emit();
  }

  pin(key: string, value: string): void {
    if (this.columnTools() && this.columns().some(column => column.key === key) && (value === 'start' || value === 'end' || value === 'none')) {
      this.columnPin.emit({ key, side: value === 'none' ? null : value });
    }
  }

  toggleColumn(key: string, checked: unknown): void {
    const column = this.columns().find(column => column.key === key);
    if (!column || column.hideable === false || typeof checked !== 'boolean') return;
    const values = new Set(this.visibleColumns());
    if (checked) values.add(key);
    else if (values.size > 1) values.delete(key);
    this.columnsChange.emit([...values]);
  }
}

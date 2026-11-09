import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Listbox } from 'primeng/listbox';
import { UiTextPipe } from '../../../localization/public-api';
import { TextField } from '../../forms/public-api';
import { AppIcon } from '../../icons/app-icon/app-icon';

export interface SelectionWorkspaceEntry {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly meta?: string;
}

@Component({
  imports: [FormsModule, Listbox, UiTextPipe, TextField, AppIcon],
  selector: 'erp-selection-workspace',
  styleUrl: './selection-workspace.scss',
  templateUrl: './selection-workspace.html',
})
export class SelectionWorkspace {
  readonly entries = input.required<readonly SelectionWorkspaceEntry[]>();
  readonly label = input.required<string>();
  readonly searchLabel = input.required<string>();
  readonly selected = input<string | null>(null);
  readonly selectionChange = output<string>();
  readonly query = signal('');
  readonly options = computed(() => [...this.entries()]);
  readonly current = computed(() => this.entries().find((entry) => entry.id === this.selected()));
  readonly listPresentation = {
    root: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '0',
        border: '0',
      },
    },
    listContainer: { style: { flex: '1', minHeight: '0', maxHeight: 'none' } },
  };
  select(value: unknown): void {
    if (typeof value === 'string' && this.entries().some((entry) => entry.id === value))
      this.selectionChange.emit(value);
  }
}

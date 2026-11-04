import { Component, computed, effect, forwardRef, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActionButton } from '../../buttons/public-api';
import { TextField } from '../../forms/public-api';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';

export interface NavigationEntry {
  readonly id: string;
  readonly label: string;
  readonly icon: AppIconName;
  readonly selected?: boolean;
  readonly children?: readonly NavigationEntry[];
}
export function filterNavigationEntries(
  entries: readonly NavigationEntry[],
  query: string,
): readonly NavigationEntry[] {
  const text = query.trim().toLocaleLowerCase();
  if (!text) return entries;
  return entries.flatMap((entry) => {
    if (entry.label.toLocaleLowerCase().includes(text)) return [entry];
    const children = entry.children ? filterNavigationEntries(entry.children, text) : [];
    return children.length ? [{ ...entry, children }] : [];
  });
}
@Component({
  selector: 'erp-navigation-list',
  imports: [
    forwardRef(() => NavigationList),
    ActionButton,
    AppIcon,
    ReactiveFormsModule,
    TextField,
  ],
  templateUrl: './navigation-list.html',
  styleUrl: './navigation-list.scss',
})
export class NavigationList {
  readonly entries = input.required<readonly NavigationEntry[]>();
  readonly expanded = input(false);
  readonly label = input.required<string>();
  readonly searchLabel = input.required<string>();
  readonly searchable = input(true);
  readonly expandedEntries = input<readonly string[]>([]);
  readonly expansionRequested = output<void>();
  readonly selected = output<string>();
  readonly search = new FormControl('', { nonNullable: true });
  private readonly query = toSignal(this.search.valueChanges, { initialValue: '' });
  private readonly branches = signal<ReadonlySet<string>>(new Set());
  private static sequence = 0;
  private readonly id = 'erp-navigation-' + ++NavigationList.sequence;
  readonly filtered = computed(() => filterNavigationEntries(this.entries(), this.query()));
  readonly childExpandedEntries = computed(() => {
    if (!this.query().trim()) return this.expandedEntries();
    const collect = (entries: readonly NavigationEntry[]): string[] =>
      entries.flatMap((entry) =>
        entry.children?.length ? [entry.id, ...collect(entry.children)] : [],
      );
    return collect(this.filtered());
  });
  constructor() {
    effect(() => {
      this.branches.set(new Set(this.expandedEntries()));
    });
  }
  branchId(id: string) {
    return this.id + '-' + id;
  }
  branchOpen(id: string) {
    return this.query().trim().length > 0 || this.branches().has(id);
  }
  activate(item: NavigationEntry): void {
    if (!item.children?.length) {
      this.selected.emit(item.id);
      return;
    }
    this.branches.update((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
    if (!this.expanded()) this.expansionRequested.emit();
  }
}

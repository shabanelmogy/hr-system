import { Component, effect, input, output, signal } from '@angular/core';
import { DialogPanel } from '../dialog-panel/dialog-panel';
import { ActionButton } from '../../buttons/public-api';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';

@Component({
  selector: 'erp-choice-dialog',
  imports: [DialogPanel, ActionButton, AppIcon],
  templateUrl: './choice-dialog.html',
  styleUrl: './choice-dialog.scss',
})
export class ChoiceDialog {
  readonly open = input(false);
  readonly identity = input('');
  readonly title = input.required<string>();
  readonly description = input('');
  readonly options = input<readonly { value: string; label: string; description?: string }[]>([]);
  readonly icon = input<AppIconName | null>(null);
  readonly cancelLabel = input.required<string>();
  readonly continueLabel = input.required<string>();
  readonly pending = input(false);
  readonly closeLabel = input.required<string>();
  readonly cancelled = output<void>();
  readonly chosen = output<string>();
  readonly selected = signal('');
  constructor() {
    effect(() => {
      this.identity();
      this.selected.set('');
    });
  }
  cancel(): void {
    if (this.open() && !this.pending()) this.cancelled.emit();
  }
  select(value: string): void {
    if (this.open() && !this.pending() && this.options().some((option) => option.value === value))
      this.selected.set(value);
  }
  choose(): void {
    if (
      this.open() &&
      !this.pending() &&
      this.selected() &&
      this.options().some((option) => option.value === this.selected())
    )
      this.chosen.emit(this.selected());
  }
}

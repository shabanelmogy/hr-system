import { Component, input, output } from '@angular/core';
import { UiTextPipe } from '../../../localization/public-api';
import { ActionButton } from '../../buttons/public-api';
import { AppIcon } from '../../icons/app-icon/app-icon';
import type { CollectionId } from '../collection.types';
import type { GridRowAction } from '../grid-options.types';

/** Shared action presentation; callers retain domain permissions and callbacks. */
@Component({
  selector: 'erp-row-actions',
  imports: [ActionButton, AppIcon, UiTextPipe],
  templateUrl: './row-actions.html',
  styleUrl: './row-actions.scss',
})
export class RowActions {
  readonly actions = input.required<readonly GridRowAction[]>();
  readonly rowKey = input<CollectionId | null>(null);
  readonly activated = output<string>();
  color(action: GridRowAction): string {
    return (
      {
        primary: 'var(--primary)',
        secondary: 'var(--foreground)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--destructive)',
      } as const
    )[action.tone ?? 'primary'];
  }
  activate(id: string) {
    if (this.actions().some((action) => action.id === id && !action.disabled))
      this.activated.emit(id);
  }
}

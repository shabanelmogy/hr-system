import { Component, computed, input, output } from '@angular/core';
import { ActionButton } from '../../buttons/public-api';
import { AppIcon } from '../../icons/app-icon/app-icon';
import { UiTextPipe } from '../../../../platform/localization/public-api';

/** Controlled shared sort direction: compact visible label, full accessible name. */
@Component({
  selector: 'erp-sort-direction-button',
  imports: [ActionButton, AppIcon, UiTextPipe],
  templateUrl: './sort-direction-button.html',
  styleUrl: './sort-direction-button.scss',
})
export class SortDirectionButton {
  readonly direction = input<'asc' | 'desc'>('asc');
  readonly disabled = input(false);
  readonly directionChange = output<'asc' | 'desc'>();
  readonly shortKey = computed(() =>
    this.direction() === 'asc'
      ? 'collections.sortAscendingShort'
      : 'collections.sortDescendingShort',
  );
  readonly fullKey = computed(() =>
    this.direction() === 'asc' ? 'collections.sortAscending' : 'collections.sortDescending',
  );
  toggle(): void {
    if (!this.disabled()) this.directionChange.emit(this.direction() === 'asc' ? 'desc' : 'asc');
  }
}

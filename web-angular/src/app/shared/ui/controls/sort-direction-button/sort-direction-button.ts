import { Component, computed, input, output } from '@angular/core';
import { ActionButton } from '../../buttons/public-api';
import { AppIcon } from '../../icons/app-icon/app-icon';
import { UiTextPipe } from '../../../localization/public-api';

/** Controlled shared sort direction: compact visible label, full accessible name. */
@Component({
  selector: 'erp-sort-direction-button',
  imports: [ActionButton, AppIcon, UiTextPipe],
  templateUrl: './sort-direction-button.html',
  styleUrl: './sort-direction-button.scss',
})
export class SortDirectionButton {
  readonly direction = input<'asc' | 'desc' | null>('asc');
  readonly disabled = input(false);
  readonly compactOnSmallScreens = input(false);
  readonly directionChange = output<'asc' | 'desc' | null>();
  readonly shortKey = computed(() =>
    this.direction() === 'asc'
      ? 'collections.sortAscendingShort'
      : this.direction() === 'desc'
        ? 'collections.sortDescendingShort'
        : 'collections.unsorted',
  );
  readonly fullKey = computed(() =>
    this.direction() === 'asc'
      ? 'collections.sortAscending'
      : this.direction() === 'desc'
        ? 'collections.sortDescending'
        : 'collections.unsorted',
  );
  readonly icon = computed(() =>
    this.direction() === 'asc' ? 'arrowUp' : this.direction() === 'desc' ? 'arrowDown' : 'sort',
  );
  toggle(): void {
    if (!this.disabled())
      this.directionChange.emit(
        this.direction() === 'asc' ? 'desc' : this.direction() === 'desc' ? null : 'asc',
      );
  }
}

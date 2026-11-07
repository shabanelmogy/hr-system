import { Component, computed, inject, input } from '@angular/core';
import { ActionButton, ActionMenuButton, type ActionMenuItem } from '../../buttons/public-api';
import { UI_LOCALIZATION, UiTextPipe } from '../../../localization/public-api';
import type { TabularExportSource, TabularFormat } from '../../../data/public-api';
import { createCollectionExport } from '../collection-export-state';

@Component({
  imports: [ActionButton, ActionMenuButton, UiTextPipe],
  selector: 'erp-collection-export-menu',
  styleUrl: './collection-export-menu.scss',
  templateUrl: './collection-export-menu.html',
})
export class CollectionExportMenu {
  readonly source = input<TabularExportSource | null>(null);
  private readonly locale = inject(UI_LOCALIZATION);
  readonly export = createCollectionExport(this.source);
  readonly formats = computed<readonly ActionMenuItem<TabularFormat>[]>(() => [
    { id: 'xlsx', label: this.locale.translate('collectionExport.excel'), icon: 'download' },
    { id: 'csv', label: this.locale.translate('collectionExport.csv'), icon: 'download' },
  ]);
}

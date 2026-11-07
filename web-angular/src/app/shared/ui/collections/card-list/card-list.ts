import { Component, contentChild, inject, input, numberAttribute, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { Checkbox } from 'primeng/checkbox';
import { UI_LOCALIZATION, UiTextPipe } from '../../../localization/public-api';
import { SurfaceCard } from '../../layout/surface-card/surface-card';
import { ScrollViewport } from '../../layout/scroll-viewport/scroll-viewport';
import { CollectionFrame } from '../collection-frame/collection-frame';
import { CollectionFeedback } from '../collection-feedback/collection-feedback';
import {
  CollectionCardTemplate,
  CollectionCardHeader,
  CollectionCardFooter,
  CollectionEmptyTemplate,
} from '../collection-templates';
import { createCollectionController } from '../collection-controller';
import type { CollectionRecordRequest } from '../collection-record-feedback';
import { collectionKeyTarget } from '../collection-keyboard';
import { attachCollectionFocus, collectionRowInteraction } from '../collection-focus';
import {
  collectionPageSizes,
  type CollectionId,
  type CollectionPageRequest,
  type CollectionSearch,
  type CollectionSearchChange,
  type CollectionSource,
} from '../collection.types';
@Component({
  selector: 'erp-card-list',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    Checkbox,
    SurfaceCard,
    ScrollViewport,
    CollectionFrame,
    CollectionFeedback,
    UiTextPipe,
  ],
  templateUrl: './card-list.html',
  styleUrls: [
    '../collection-slots.scss',
    './card-list.scss',
    '../collection-row-flash.scss',
    './card-list.component.scss',
  ],
})
export class CardList<T> {
  readonly toolbarVisible = input(true);
  readonly showFooter = input(true);
  readonly toolbarLayout = input<'responsive' | 'single-row'>('responsive');
  readonly searchMaxWidth = input<number | null>(null);
  readonly recordNavigation = input(false);
  readonly recordRequest = input<CollectionRecordRequest | null>(null);
  readonly layout = input<'auto' | 'responsive' | 'fit'>('auto');
  readonly minCardWidth = input(260, { transform: numberAttribute });
  readonly appearance = input<'compact' | 'entity'>('compact');
  private readonly locale = inject(UI_LOCALIZATION);
  readonly source = input.required<CollectionSource<T>>();
  readonly label = input.required<string>();
  readonly rowId = input.required<(row: T) => CollectionId>();
  readonly rowLabel = input.required<(row: T) => string>();
  readonly selectable = input<(row: T) => boolean>(() => true);
  readonly selectionEnabled = input(false);
  readonly search = input<CollectionSearch>();
  readonly pageSizes = input<readonly number[]>(collectionPageSizes);
  readonly pageChange = output<CollectionPageRequest>();
  readonly activeChange = output<CollectionId | null>();
  readonly selectionChange = output<readonly CollectionId[]>();
  readonly searchChange = output<CollectionSearchChange>();
  readonly retry = output<void>();
  readonly rowActivated = output<T>();
  readonly controller = createCollectionController(
    this.source,
    this.rowId,
    this.selectable,
    {
      page: (request) => this.pageChange.emit(request),
      active: (id) => this.activeChange.emit(id),
      selected: (ids) => this.selectionChange.emit(ids),
    },
    undefined,
    this.recordRequest,
  );
  readonly card = contentChild(CollectionCardTemplate<T>);
  readonly header = contentChild(CollectionCardHeader<T>);
  readonly footer = contentChild(CollectionCardFooter<T>);
  readonly empty = contentChild(CollectionEmptyTemplate);
  constructor() {
    attachCollectionFocus(this.controller);
  }
  clickRow(row: T, event: Event) {
    if (!collectionRowInteraction(event)) this.controller.activate(this.rowId()(row), true);
  }
  keyRow(row: T, event: KeyboardEvent) {
    if (
      event.defaultPrevented ||
      collectionRowInteraction(event) ||
      this.controller.view().kind !== 'ready' ||
      !this.controller.view().rows.includes(row)
    )
      return;
    if (event.key === 'Enter' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      this.rowActivated.emit(row);
      return;
    }
    if (event.key === ' ' && this.selectionEnabled()) {
      event.preventDefault();
      const id = this.rowId()(row);
      this.controller.toggle(id, !this.controller.selectedIds().includes(id));
      return;
    }
    const view = this.controller.view(),
      target = collectionKeyTarget(event, {
        ...view.query,
        rowIndex: view.rows.indexOf(row),
        rowCount: view.rows.length,
        total: view.total,
        hasNextPage: view.hasNextPage,
        rtl: this.locale.direction() === 'rtl',
      });
    if (target !== null) {
      event.preventDefault();
      if (typeof target === 'number') this.controller.navigateIndex(target);
      else this.controller.navigate(target);
    }
  }
}

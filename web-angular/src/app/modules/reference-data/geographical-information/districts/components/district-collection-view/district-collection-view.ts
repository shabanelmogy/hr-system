import { Component, computed, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/public-api';
import {
  ActionButton,
  AppIcon,
  MyDataGrid,
  CardList,
  CollectionCell,
  CollectionColumnPipe,
  CollectionCardHeader,
  CollectionCardTemplate,
  CollectionCardFooter,
  CollectionEmptyTemplate,
  CollectionRecordFeedback,
  FeedbackState,
  RowActions,
  StatusBadge,
  type CollectionSearch,
} from '../../../../../../shared/ui/public-api';
import { DistrictReadState } from '../../state/district-read-state';
import { DistrictEditorState } from '../../state/district-editor-state';
import { DistrictLifecycleState } from '../../state/district-lifecycle-state';
import { DistrictListCriteria } from '../district-list-criteria/district-list-criteria';
import {
  districtSearchFields,
  districtSearchOperators,
  type DistrictListItem,
} from '../../types/district';
import { districtName, districtNumber, districtDate } from '../../utils/district-presentation';
import { districtColumns, districtRowActions } from '../../utils/district-list-presentation';
import { DistrictCardHeader } from '../district-card-header/district-card-header';
import { DistrictCardContent } from '../district-card-content/district-card-content';

@Component({
  selector: 'erp-district-collection-view',
  imports: [
    NgTemplateOutlet,
    ActionButton,
    AppIcon,
    MyDataGrid,
    CardList,
    CollectionCell,
    CollectionColumnPipe,
    CollectionCardHeader,
    CollectionCardTemplate,
    CollectionCardFooter,
    CollectionEmptyTemplate,
    FeedbackState,
    RowActions,
    StatusBadge,
    DistrictListCriteria,
    DistrictCardHeader,
    DistrictCardContent,
    UiTextPipe,
  ],
  templateUrl: './district-collection-view.html',
  styleUrl: './district-collection-view.scss',
})
export class DistrictCollectionView {
  readonly kind = input<'grid' | 'cards'>('grid');
  readonly toolbarVisible = input(true);
  readonly state = inject(DistrictReadState);
  readonly editor = inject(DistrictEditorState);
  readonly lifecycle = inject(DistrictLifecycleState);
  readonly records = inject(CollectionRecordFeedback);
  readonly locale = inject(LocalizationRuntime);
  readonly id = (row: DistrictListItem) => row.id;
  readonly rowLabel = (row: DistrictListItem) => districtName(row, this.locale.language());
  readonly stateLabel = (row: DistrictListItem) => districtName(row.state, this.locale.language());
  readonly status = (row: DistrictListItem) =>
    this.districtText('districts.status.' + (row.isDeleted ? 'archived' : 'active'));
  readonly actions = (row: DistrictListItem) =>
    districtRowActions(
      {
        edit: this.editor.canEdit(row.id),
        archive: this.lifecycle.can(row, 'archive'),
        restore: this.lifecycle.can(row, 'restore'),
      },
      (key) => this.text(key),
    );
  readonly columns = computed(() =>
    districtColumns({
      text: (key) => this.text(key),
      districtText: (key) => this.districtText(key),
      date: (value) => districtDate(value, this.locale.language()),
      state: this.stateLabel,
      status: this.status,
    }),
  );
  readonly sort = computed(() => ({
    field: this.state.query().sortBy,
    direction: this.state.query().sortDirection,
  }));
  readonly search = computed<CollectionSearch>(() => ({
    value: this.state.searchDraft(),
    maxLength: 200,
    placeholder: this.districtText('districts.search.placeholder'),
    field: {
      label: this.text('search.searchField'),
      value: this.state.query().searchField,
      options: districtSearchFields.map((value) => ({
        value,
        label: value === 'all' ? this.text('common.all') : this.fieldLabel(value),
      })),
    },
    operator: {
      label: this.text('search.searchType'),
      value: this.state.query().searchOperator,
      options: districtSearchOperators.map((value) => ({
        value,
        label: this.districtText('districts.search.operators.' + value),
      })),
    },
  }));
  act(event: { row: DistrictListItem; action: string }): void {
    const source = this.state.source();
    if (source.kind !== 'ready' || !source.result?.rows.some((row) => row.id === event.row.id))
      return;
    if (event.action === 'view') this.state.open(event.row.id);
    else if (event.action === 'edit') this.editor.edit(event.row.id);
    else if (event.action === 'archive' || event.action === 'restore')
      this.lifecycle.request(event.row, event.action);
  }
  number(value: number): string {
    return districtNumber(value, this.locale.language());
  }
  text(key: string): string {
    return this.locale.translate(key);
  }
  districtText(key: string): string {
    return this.locale.translate(key, 'reference-districts');
  }
  fieldLabel(value: string): string {
    return value === 'nameAr' || value === 'nameEn' || value === 'createdOn'
      ? this.text('general.' + value)
      : this.districtText('districts.' + value);
  }
}

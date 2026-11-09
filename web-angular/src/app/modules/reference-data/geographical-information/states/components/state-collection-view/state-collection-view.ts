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
import { StateReadState } from '../../state/state-read-state';
import { StateEditorState } from '../../state/state-editor-state';
import { StateLifecycleState } from '../../state/state-lifecycle-state';
import { StateListCriteria } from '../state-list-criteria/state-list-criteria';
import { stateSearchFields, stateSearchOperators, type StateListItem } from '../../types/state';
import { stateName, stateNumber, stateDate } from '../../utils/state-presentation';
import { stateColumns, stateRowActions } from '../../utils/state-list-presentation';
import { StateCardHeader } from '../state-card-header/state-card-header';
import { StateCardContent } from '../state-card-content/state-card-content';

@Component({
  selector: 'erp-state-collection-view',
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
    StateListCriteria,
    StateCardHeader,
    StateCardContent,
    UiTextPipe,
  ],
  templateUrl: './state-collection-view.html',
  styleUrl: './state-collection-view.scss',
})
export class StateCollectionView {
  readonly kind = input<'grid' | 'cards'>('grid');
  readonly searchVisible = input(false);
  readonly state = inject(StateReadState);
  readonly editor = inject(StateEditorState);
  readonly lifecycle = inject(StateLifecycleState);
  readonly records = inject(CollectionRecordFeedback);
  readonly locale = inject(LocalizationRuntime);
  readonly id = (row: StateListItem) => row.id;
  readonly rowLabel = (row: StateListItem) => stateName(row, this.locale.language());
  readonly countryLabel = (row: StateListItem) => stateName(row.country, this.locale.language());
  readonly status = (row: StateListItem) =>
    this.stateText('states.status.' + (row.isDeleted ? 'archived' : 'active'));
  readonly actions = (row: StateListItem) =>
    stateRowActions(
      {
        edit: this.editor.canEdit(row.id),
        archive: this.lifecycle.can(row, 'archive'),
        restore: this.lifecycle.can(row, 'restore'),
      },
      (key) => this.text(key),
    );
  readonly columns = computed(() =>
    stateColumns({
      text: (key) => this.text(key),
      stateText: (key) => this.stateText(key),
      date: (value) => stateDate(value, this.locale.language()),
      country: this.countryLabel,
      status: this.status,
    }),
  );
  readonly sort = this.state.sort;
  readonly search = computed<CollectionSearch>(() => ({
    value: this.state.searchDraft(),
    maxLength: 200,
    placeholder: this.stateText('states.search.placeholder'),
    field: {
      label: this.text('search.searchField'),
      value: this.state.query().searchField,
      options: stateSearchFields.map((value) => ({
        value,
        label: value === 'all' ? this.text('common.all') : this.fieldLabel(value),
      })),
    },
    operator: {
      label: this.text('search.searchType'),
      value: this.state.query().searchOperator,
      options: stateSearchOperators.map((value) => ({
        value,
        label: this.stateText('states.search.operators.' + value),
      })),
    },
  }));
  act(event: { row: StateListItem; action: string }): void {
    const source = this.state.source();
    if (source.kind !== 'ready' || !source.result?.rows.some((row) => row.id === event.row.id))
      return;
    if (event.action === 'view') this.state.open(event.row.id);
    else if (event.action === 'edit') this.editor.edit(event.row.id);
    else if (event.action === 'archive' || event.action === 'restore')
      this.lifecycle.request(event.row, event.action);
  }
  number(value: number): string {
    return stateNumber(value, this.locale.language());
  }
  text(key: string): string {
    return this.locale.translate(key);
  }
  stateText(key: string): string {
    return this.locale.translate(key, 'reference-states');
  }
  fieldLabel(value: string): string {
    return value === 'nameAr' || value === 'nameEn' || value === 'createdOn'
      ? this.text('general.' + value)
      : this.stateText('states.' + value);
  }
}

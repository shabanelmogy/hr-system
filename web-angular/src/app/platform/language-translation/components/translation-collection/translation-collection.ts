import { Component, computed, inject } from '@angular/core';
import {
  MyDataGrid,
  CollectionCell,
  CollectionColumnPipe,
  StatusBadge,
  type CollectionColumn,
  type GridRowAction,
} from '../../../../shared/ui/public-api';
import { LocalizationRuntime } from '../../../localization/public-api';
import { LanguageTranslationState } from '../../state/language-translation-state';
import { TranslationEditorState } from '../../state/translation-editor-state';
import type { LanguageTranslationRow } from '../../types/language-translation';
import { TranslationCriteria } from '../translation-criteria/translation-criteria';
@Component({
  selector: 'erp-translation-collection',
  imports: [MyDataGrid, CollectionCell, CollectionColumnPipe, StatusBadge, TranslationCriteria],
  templateUrl: './translation-collection.html',
  styleUrl: './translation-collection.scss',
})
export class TranslationCollection {
  readonly reads = inject(LanguageTranslationState);
  readonly editor = inject(TranslationEditorState);
  readonly locale = inject(LocalizationRuntime);
  readonly search = computed(() => ({
    value: this.reads.searchDraft(),
    placeholder: this.text('search'),
    maxLength: 200,
  }));
  readonly columns = computed<readonly CollectionColumn<LanguageTranslationRow>[]>(() => [
    { key: 'key', header: this.text('key'), minWidth: 220, flex: 1, value: (row) => row.key },
    {
      key: 'baseValue',
      header: this.text('baseValue'),
      minWidth: 220,
      flex: 1,
      value: (row) => row.baseValue,
    },
    {
      key: 'targetValue',
      header: this.locale.translate('systemUiTexts.targetValue', 'platform-auth'),
      minWidth: 220,
      flex: 1,
      value: (row) => row.targetValue,
    },
    {
      key: 'status',
      header: this.text('status'),
      width: 170,
      value: (row) => this.text(row.isCustomized ? 'customized' : 'missing'),
    },
  ]);
  readonly actions = (row: LanguageTranslationRow): readonly GridRowAction[] => [
    {
      id: 'edit',
      label: this.text('edit'),
      icon: 'edit',
      disabled: !this.editor.canEdit() || this.editor.active(),
    },
    {
      id: 'reset',
      label: this.text('reset'),
      icon: 'reset',
      disabled: !this.editor.canReset() || !row.isCustomized || this.editor.active(),
    },
  ];
  text(key: string): string {
    return this.locale.translate('companyLocalizations.' + key, 'platform-auth');
  }
  action(row: LanguageTranslationRow, action: string): void {
    if (action === 'edit' || action === 'reset') this.editor.open(row, action === 'reset');
  }
}

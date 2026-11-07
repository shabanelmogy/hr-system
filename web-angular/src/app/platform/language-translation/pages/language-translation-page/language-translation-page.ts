import { Component, inject } from '@angular/core';
import { ActionButton, PageHeader } from '../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { LanguageTranslationState } from '../../state/language-translation-state';
import { TranslationEditorState } from '../../state/translation-editor-state';
import { TranslationCollection } from '../../components/translation-collection/translation-collection';
import { TranslationEditor } from '../../components/translation-editor/translation-editor';
@Component({
  selector: 'erp-language-translation-page',
  imports: [PageHeader, ActionButton, UiTextPipe, TranslationCollection, TranslationEditor],
  providers: [LanguageTranslationState, TranslationEditorState],
  templateUrl: './language-translation-page.html',
  styleUrl: './language-translation-page.scss',
})
export class LanguageTranslationPage {
  readonly locale = inject(LocalizationRuntime);
  readonly state = inject(LanguageTranslationState);
  readonly editor = inject(TranslationEditorState);
  constructor() {
    void this.locale.loadNamespace('core');
    void this.locale.loadNamespace('platform-auth');
  }
}

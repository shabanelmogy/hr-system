import { Component, computed, inject, viewChild } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import {
  ActionButton,
  ConfirmationDialog,
  DialogPanel,
  FormCloseGuard,
  FormContainer,
  TextField,
  type FieldMessages,
} from '../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { TranslationEditorState } from '../../state/translation-editor-state';
@Component({
  selector: 'erp-translation-editor',
  imports: [
    ActionButton,
    ConfirmationDialog,
    DialogPanel,
    FormCloseGuard,
    FormContainer,
    TextField,
    FormField,
    UiTextPipe,
  ],
  templateUrl: './translation-editor.html',
})
export class TranslationEditor {
  readonly editor = inject(TranslationEditorState);
  readonly locale = inject(LocalizationRuntime);
  readonly closeGuard = viewChild.required(FormCloseGuard);
  readonly container = viewChild(FormContainer);
  readonly messages = computed<FieldMessages>(() => ({
    required: this.text('valueRequired'),
    maxlength: this.text('valueRequired'),
    placeholders: this.text('valueRequired'),
  }));
  readonly feedback = computed(() => (this.editor.feedback() ? this.text('saveFailed') : ''));
  text(key: string): string {
    return this.locale.translate('companyLocalizations.' + key, 'platform-auth');
  }
}

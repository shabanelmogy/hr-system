import { Component, computed, inject, output, viewChild } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ActionButton, FormContainer, NumericField } from '../../../../shared/ui/public-api';
import { UiTextPipe } from '../../../localization/public-api';
import { RetentionEditorState } from '../../state/retention-editor-state';
import { RetentionPresentation } from '../../presentation/retention-presentation';

@Component({
  selector: 'erp-retention-form',
  imports: [ActionButton, FormContainer, NumericField, FormField, UiTextPipe],
  templateUrl: './retention-form.html',
  styleUrl: './retention-form.scss',
})
export class RetentionForm {
  readonly editor = inject(RetentionEditorState);
  readonly captions = inject(RetentionPresentation);
  readonly cancelled = output<void>();
  readonly container = viewChild.required(FormContainer);
  readonly checking = computed(() => this.container().checking());
  readonly feedback = computed(() => {
    const status = this.editor.feedback();
    return status
      ? this.captions.text(
          status === 'conflict'
            ? 'conflict'
            : status === 'uncertain'
              ? 'saveUncertain'
              : status === 'forbidden'
                ? 'forbidden'
                : 'saveFailed',
        )
      : '';
  });
}

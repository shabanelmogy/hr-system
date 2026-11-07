import { Component, inject, viewChild } from '@angular/core';
import { DialogPanel, FormCloseGuard } from '../../../../shared/ui/public-api';
import { UiTextPipe } from '../../../localization/public-api';
import { RetentionEditorState } from '../../state/retention-editor-state';
import { RetentionPresentation } from '../../presentation/retention-presentation';
import { RetentionForm } from '../retention-form/retention-form';

@Component({
  selector: 'erp-retention-editor',
  imports: [DialogPanel, FormCloseGuard, UiTextPipe, RetentionForm],
  templateUrl: './retention-editor.html',
})
export class RetentionEditor {
  readonly editor = inject(RetentionEditorState);
  readonly captions = inject(RetentionPresentation);
  readonly closeGuard = viewChild.required(FormCloseGuard);
  readonly container = viewChild(RetentionForm);
}

import { Component, inject, viewChild } from '@angular/core';
import {
  DialogPanel,
  FeedbackState,
  FormContainer,
  FormCloseGuard,
  ActionButton,
  AppIcon,
} from '../../../../shared/ui/public-api';
import { UiTextPipe } from '../../../localization/public-api';
import { AdminEditorState } from '../../state/admin-editor-state';
import { AdminFormPresentation } from '../../presentation/admin-form-presentation';
import { AdminAccountFields } from '../admin-account-fields/admin-account-fields';
import { AdminAssignmentFields } from '../admin-assignment-fields/admin-assignment-fields';
@Component({
  selector: 'erp-admin-editor',
  providers: [AdminFormPresentation],
  imports: [
    DialogPanel,
    FeedbackState,
    FormContainer,
    FormCloseGuard,
    ActionButton,
    AppIcon,
    UiTextPipe,
    AdminAccountFields,
    AdminAssignmentFields,
  ],
  templateUrl: './admin-editor.html',
})
export class AdminEditor {
  readonly editor = inject(AdminEditorState);
  readonly captions = inject(AdminFormPresentation);
  readonly guard = viewChild.required(FormCloseGuard);
}

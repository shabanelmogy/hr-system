import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TextField, BooleanField } from '../../../../shared/ui/public-api';
import { AdminEditorState } from '../../state/admin-editor-state';
import { AdminFormPresentation } from '../../presentation/admin-form-presentation';
@Component({
  selector: 'erp-admin-account-fields',
  imports: [FormField, TextField, BooleanField],
  templateUrl: './admin-account-fields.html',
  styleUrl: './admin-account-fields.scss',
})
export class AdminAccountFields {
  readonly editor = inject(AdminEditorState);
  readonly captions = inject(AdminFormPresentation);
}

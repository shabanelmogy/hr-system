import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TextField } from '../../../../../shared/ui/public-api';
import { TenantEditorState } from '../../state/tenant-editor-state';
import { TenantFormPresentation } from '../../presentation/tenant-form-presentation';

@Component({
  selector: 'erp-tenant-notes-fields',
  imports: [FormField, TextField],
  templateUrl: './tenant-notes-fields.html',
})
export class TenantNotesFields {
  readonly editor = inject(TenantEditorState);
  readonly captions = inject(TenantFormPresentation);
}

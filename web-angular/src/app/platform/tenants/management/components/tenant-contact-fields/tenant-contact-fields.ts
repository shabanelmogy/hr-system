import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TextField } from '../../../../../shared/ui/public-api';
import { TenantEditorState } from '../../state/tenant-editor-state';
import { TenantFormPresentation } from '../../presentation/tenant-form-presentation';

@Component({
  selector: 'erp-tenant-contact-fields',
  imports: [FormField, TextField],
  styleUrl: './tenant-contact-fields.scss',
  templateUrl: './tenant-contact-fields.html',
})
export class TenantContactFields {
  readonly editor = inject(TenantEditorState);
  readonly captions = inject(TenantFormPresentation);
}

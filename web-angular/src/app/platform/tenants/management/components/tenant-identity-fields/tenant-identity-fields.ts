import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { BooleanField, TextField } from '../../../../../shared/ui/public-api';
import { TenantEditorState } from '../../state/tenant-editor-state';
import { TenantFormPresentation } from '../../presentation/tenant-form-presentation';

@Component({
  selector: 'erp-tenant-identity-fields',
  imports: [FormField, BooleanField, TextField],
  styleUrl: './tenant-identity-fields.scss',
  templateUrl: './tenant-identity-fields.html',
})
export class TenantIdentityFields {
  readonly editor = inject(TenantEditorState);
  readonly captions = inject(TenantFormPresentation);
}

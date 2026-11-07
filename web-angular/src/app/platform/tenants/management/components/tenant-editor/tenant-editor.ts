import { Component, inject, viewChild } from '@angular/core';
import { DialogPanel, FeedbackState, FormCloseGuard } from '../../../../../shared/ui/public-api';
import { UiTextPipe } from '../../../../localization/public-api';
import { TenantEditorState } from '../../state/tenant-editor-state';
import { TenantFormPresentation } from '../../presentation/tenant-form-presentation';
import { TenantForm } from '../tenant-form/tenant-form';

@Component({
  selector: 'erp-tenant-editor',
  providers: [TenantFormPresentation],
  imports: [DialogPanel, FeedbackState, FormCloseGuard, UiTextPipe, TenantForm],
  templateUrl: './tenant-editor.html',
})
export class TenantEditor {
  readonly editor = inject(TenantEditorState);
  readonly captions = inject(TenantFormPresentation);
  readonly closeGuard = viewChild.required(FormCloseGuard);
}

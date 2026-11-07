import { Component, computed, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import {
  MultiReferenceField,
  ReferenceField,
  type ReferenceSource,
} from '../../../../shared/ui/public-api';
import { AdminEditorState } from '../../state/admin-editor-state';
import { AdminFormPresentation } from '../../presentation/admin-form-presentation';
@Component({
  selector: 'erp-admin-assignment-fields',
  imports: [FormField, MultiReferenceField, ReferenceField],
  templateUrl: './admin-assignment-fields.html',
  styleUrl: './admin-assignment-fields.scss',
})
export class AdminAssignmentFields {
  readonly editor = inject(AdminEditorState);
  readonly captions = inject(AdminFormPresentation);
  readonly options = computed(() =>
    this.editor.choices.tenants().map((tenant) => ({
      value: tenant.id,
      label: tenant.name + ' (' + tenant.identifier + ')',
      disabled: !tenant.isActive || tenant.lifecycleStatus !== 'active',
    })),
  );
  readonly defaults = computed<ReferenceSource>(() => {
    const ids = this.editor.form.tenantIds().value();
    const query = { scopeKey: this.editor.identity(), search: '' };
    return {
      query,
      kind: 'ready',
      result: {
        query,
        options: this.options().filter((option) => ids.includes(option.value)),
        hasMore: false,
      },
    };
  });
}

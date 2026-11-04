import { Component, computed, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import {
  ActionButton,
  BooleanField,
  CollectionCell,
  CollectionColumnPipe,
  FeedbackState,
  FormContainer,
  MyDataGrid,
  type CollectionColumn,
} from '../../../../../shared/ui/public-api';
import type { GlobalTemplateAccessState } from '../../state/global-template-access-state';
import { globalTemplateRights, type GlobalTemplateRole } from '../../types/global-template';

@Component({
  imports: [
    ReactiveFormsModule,
    ActionButton,
    BooleanField,
    CollectionCell,
    CollectionColumnPipe,
    FeedbackState,
    FormContainer,
    MyDataGrid,
    UiTextPipe,
  ],
  selector: 'erp-global-template-permissions',
  templateUrl: './global-template-permissions.html',
})
export class GlobalTemplatePermissions {
  readonly state = input.required<GlobalTemplateAccessState>();
  readonly locale = inject(LocalizationRuntime);
  readonly rights = globalTemplateRights;
  readonly rowId = (role: GlobalTemplateRole) => role.id;
  readonly columns = computed<readonly CollectionColumn<GlobalTemplateRole>[]>(() => [
    {
      key: 'role',
      header: this.text('crystalReports.permissions'),
      value: (role) => role.name,
      minWidth: 170,
    },
    {
      key: 'tenant',
      header: this.text('globalTemplates.roleScope'),
      value: (role) => role.tenantName || this.text('globalTemplates.platformRole'),
      minWidth: 190,
    },
    ...this.rights.map((right) => ({
      key: right,
      header: this.text('crystalReports.rights.' + right),
      value: (role: GlobalTemplateRole) =>
        this.state()
          .draft()
          .find((grant) => grant.roleId === role.id)
          ?.rights.includes(right)
          ? this.text('crystalReports.rights.' + right)
          : '—',
      minWidth: 150,
    })),
  ]);
  text(key: string): string {
    return this.locale.translate(key, 'reporting');
  }
  removeLabel(name: string): string {
    return this.locale.translate('globalTemplates.removeRole', 'reporting', { name });
  }
}

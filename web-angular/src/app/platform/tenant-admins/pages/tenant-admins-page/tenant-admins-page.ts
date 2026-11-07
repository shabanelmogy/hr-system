import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  PageHeader,
  CardList,
  CollectionCardTemplate,
  CollectionCardHeader,
  CollectionCardFooter,
  CollectionEmptyTemplate,
  FeedbackState,
  RowActions,
  FeedbackNotifications,
  type GridRowAction,
} from '../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { AdminReadState } from '../../state/admin-read-state';
import { AdminTenantChoices } from '../../state/admin-tenant-choices';
import { AdminEditorState } from '../../state/admin-editor-state';
import { AdminDeleteState } from '../../state/admin-delete-state';
import { AdminEditor } from '../../components/admin-editor/admin-editor';
import { AdminDeleteConfirmation } from '../../components/admin-delete-confirmation/admin-delete-confirmation';
import { AdminCardHeader } from '../../components/admin-card-header/admin-card-header';
import { AdminCardContent } from '../../components/admin-card-content/admin-card-content';
import type { TenantAdmin } from '../../types/tenant-admin';
@Component({
  selector: 'erp-tenant-admins-page',
  providers: [AdminReadState, AdminTenantChoices, AdminEditorState, AdminDeleteState],
  imports: [
    PageHeader,
    CardList,
    CollectionCardTemplate,
    CollectionCardHeader,
    CollectionCardFooter,
    CollectionEmptyTemplate,
    FeedbackState,
    RowActions,
    UiTextPipe,
    AdminEditor,
    AdminDeleteConfirmation,
    AdminCardHeader,
    AdminCardContent,
  ],
  templateUrl: './tenant-admins-page.html',
  styleUrl: './tenant-admins-page.scss',
})
export class TenantAdminsPage {
  readonly reads = inject(AdminReadState);
  readonly choices = inject(AdminTenantChoices);
  readonly editor = inject(AdminEditorState);
  readonly remove = inject(AdminDeleteState);
  readonly locale = inject(LocalizationRuntime);
  private readonly notices = inject(FeedbackNotifications);
  readonly id = (row: TenantAdmin) => row.id;
  readonly exportSource = computed(() =>
    this.reads.exportSource(
      [
        {
          key: 'firstName',
          header: this.text('firstName'),
          value: (row: TenantAdmin) => row.firstName,
        },
        {
          key: 'lastName',
          header: this.text('lastName'),
          value: (row: TenantAdmin) => row.lastName,
        },
        {
          key: 'userName',
          header: this.text('userName'),
          value: (row: TenantAdmin) => row.userName,
        },
        { key: 'email', header: this.text('email'), value: (row: TenantAdmin) => row.email },
        {
          key: 'isDisabled',
          header: this.text('disabled'),
          value: (row: TenantAdmin) => row.isDisabled,
        },
        { key: 'isLocked', header: this.text('locked'), value: (row: TenantAdmin) => row.isLocked },
        {
          key: 'tenants',
          header: this.text('assignedTenants'),
          value: (row: TenantAdmin) => row.tenants.map((tenant) => tenant.name).join(' · '),
        },
      ],
      this.locale.language(),
    ),
  );
  readonly label = (row: TenantAdmin) => row.firstName + ' ' + row.lastName;
  constructor() {
    void this.locale.loadNamespace('core');
    void this.locale.loadNamespace('platform-tenants');
    this.editor.saved.pipe(takeUntilDestroyed()).subscribe(() => {
      this.reads.refresh();
      this.notices.success('tenantAdmins.saved', 'platform-tenants');
    });
    this.remove.completed
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.notices.success('tenantAdmins.deleted', 'platform-tenants'));
  }
  text(key: string): string {
    return this.locale.translate('tenantAdmins.' + key, 'platform-tenants');
  }
  readonly actions = (_row: TenantAdmin): readonly GridRowAction[] => [
    ...(this.editor.canWrite()
      ? [{ id: 'edit', label: this.locale.translate('actions.edit'), icon: 'edit' as const }]
      : []),
    ...(this.remove.canWrite()
      ? [
          {
            id: 'delete',
            label: this.locale.translate('actions.delete'),
            icon: 'archive' as const,
            tone: 'danger' as const,
          },
        ]
      : []),
  ];
  act(row: TenantAdmin, action: string): void {
    if (this.editor.active() || this.remove.active()) return;
    if (action === 'edit') this.editor.edit(row.id);
    else if (action === 'delete') this.remove.request(row);
  }
  create(): void {
    if (!this.remove.active()) this.editor.create();
  }
  refresh(): void {
    this.reads.refresh();
    this.choices.refresh();
  }
}

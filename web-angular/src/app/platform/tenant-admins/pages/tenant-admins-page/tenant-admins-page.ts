import { Component, computed, inject, input, signal } from '@angular/core';
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
  SelectionWorkspace,
  type CollectionSource,
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
import { adminTenantDirectory } from '../../state/admin-tenant-directory';
@Component({
  selector: 'erp-tenant-admins-page',
  providers: [AdminReadState, AdminTenantChoices, AdminEditorState, AdminDeleteState],
  imports: [
    PageHeader,
    SelectionWorkspace,
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
  readonly tenantId = input<string | null>(null);
  readonly reads = inject(AdminReadState);
  readonly choices = inject(AdminTenantChoices);
  readonly editor = inject(AdminEditorState);
  readonly remove = inject(AdminDeleteState);
  readonly locale = inject(LocalizationRuntime);
  private readonly notices = inject(FeedbackNotifications);
  readonly id = (row: TenantAdmin) => row.id;
  private readonly requestedTenant = signal<{ scopeKey: string; id: string } | null>(null);
  readonly directory = computed(() => {
    const view = this.reads.view();
    if (view.kind !== 'ready') return [];
    const collator = new Intl.Collator(this.locale.language());
    return adminTenantDirectory(view.data, this.choices.tenants(), this.text('unassignedTenant'))
      .filter((entry) => this.tenantId() === null || entry.id === 'tenant:' + this.tenantId())
      .sort((a, b) =>
        a.id === 'unassigned' ? 1 : b.id === 'unassigned' ? -1 : collator.compare(a.label, b.label),
      )
      .map((entry) => ({
        ...entry,
        meta: this.locale.translate('tenantAdmins.groupCount', 'platform-tenants', {
          count: entry.admins.length,
        }),
      }));
  });
  readonly selectedTenant = computed(() => {
    const request = this.requestedTenant();
    return (
      (request?.scopeKey === this.reads.source().query.scopeKey
        ? this.directory().find((entry) => entry.id === request.id)
        : undefined) ??
      this.directory()[0] ??
      null
    );
  });
  readonly tenantSource = computed<CollectionSource<TenantAdmin>>(() => {
    const source = this.reads.source();
    if (source.kind !== 'ready') return source;
    const tenant = this.selectedTenant();
    const rows = tenant?.admins ?? [];
    const query = {
      ...source.query,
      criteriaKey: tenant?.id ?? 'none',
      pageSize: Math.max(1, rows.length),
    };
    return {
      query,
      kind: 'ready',
      result: { query, rows, total: rows.length, hasNextPage: false },
    };
  });
  selectTenant(id: string): void {
    if (this.directory().some((entry) => entry.id === id))
      this.requestedTenant.set({ scopeKey: this.reads.source().query.scopeKey, id });
  }
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
      this.tenantId(),
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
    if (!this.remove.active()) this.editor.create(this.tenantId());
  }
  refresh(): void {
    this.reads.refresh();
    this.choices.refresh();
  }
}

import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionButton,
  CardList,
  CollectionCardFooter,
  CollectionCardHeader,
  CollectionCardTemplate,
  CollectionCell,
  CollectionColumnPipe,
  CollectionEmptyTemplate,
  CollectionRecordFeedback,
  FeedbackState,
  MyDataGrid,
  RowActions,
  StatusBadge,
  type CollectionSearch,
} from '../../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../localization/public-api';
import { TenantReadState } from '../../state/tenant-read-state';
import { TenantEditorState } from '../../state/tenant-editor-state';
import { TenantAccessState } from '../../state/tenant-access-state';
import { statusAccent } from '../../../presentation/dashboard-utils';
import type { TenantRecord } from '../../types/tenant';
import { tenantColumns, tenantRowActions } from '../../presentation/tenant-list-presentation';
import { TenantListCriteria } from '../tenant-list-criteria/tenant-list-criteria';
import { TenantCardHeader } from '../tenant-card-header/tenant-card-header';
import { TenantCardContent } from '../tenant-card-content/tenant-card-content';

@Component({
  selector: 'erp-tenant-collection-view',
  imports: [
    ActionButton,
    CardList,
    CollectionCardFooter,
    CollectionCardHeader,
    CollectionCardTemplate,
    CollectionCell,
    CollectionColumnPipe,
    CollectionEmptyTemplate,
    FeedbackState,
    MyDataGrid,
    RowActions,
    StatusBadge,
    TenantListCriteria,
    TenantCardHeader,
    TenantCardContent,
    UiTextPipe,
  ],
  templateUrl: './tenant-collection-view.html',
  styleUrl: './tenant-collection-view.scss',
})
export class TenantCollectionView {
  private readonly router = inject(Router);
  readonly kind = input<'grid' | 'cards'>('grid');
  readonly toolbarVisible = input(true);
  readonly reads = inject(TenantReadState);
  readonly editor = inject(TenantEditorState);
  readonly access = inject(TenantAccessState);
  readonly records = inject(CollectionRecordFeedback);
  readonly locale = inject(LocalizationRuntime);
  readonly id = (row: TenantRecord) => row.id;
  readonly label = (row: TenantRecord) => row.name;
  readonly statusAccent = statusAccent;
  readonly columns = computed(() =>
    tenantColumns(
      (key) => this.text(key),
      (value) => this.date(value),
    ),
  );
  readonly sort = this.reads.sort;
  readonly search = computed<CollectionSearch>(() => ({
    value: this.reads.searchDraft(),
    maxLength: 200,
    placeholder: this.text('tenantManagement.searchPlaceholder'),
  }));
  readonly actions = (row: TenantRecord) =>
    tenantRowActions(
      this.editor.canCreate() && row.lifecycleStatus === 'active',
      row.isActive,
      (key) => this.text(key),
      this.access.canWrite() && row.lifecycleStatus === 'active',
      this.access.active(),
    );
  act(event: { row: TenantRecord; action: string }): void {
    if (
      (event.action === 'activate' && !event.row.isActive) ||
      (event.action === 'deactivate' && event.row.isActive)
    ) {
      this.access.request(event.row);
      return;
    }
    const source = this.reads.source();
    if (
      event.action === 'edit' &&
      source.kind === 'ready' &&
      source.result?.rows.some(
        (row) => row.id === event.row.id && row.lifecycleStatus === 'active',
      ) &&
      this.editor.canCreate() &&
      !this.access.active()
    )
      void this.router.navigate(['/super-admin/tenants', event.row.id, 'edit']);
  }
  text(key: string): string {
    return this.locale.translate(
      key,
      key.startsWith('tenantManagement.') ? 'platform-tenants' : 'core',
    );
  }
  date(value: string): string {
    return new Intl.DateTimeFormat(this.locale.language(), { dateStyle: 'medium' }).format(
      new Date(value),
    );
  }
}

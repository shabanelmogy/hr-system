import { viewChild } from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { createViewPreference, UnsavedChanges } from '../../../../../shared/data/public-api';
import {
  CollectionRecordFeedback,
  FeedbackNotifications,
  FeedbackState,
  PageHeader,
  type PageViewOption,
} from '../../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../localization/public-api';
import { TenantReadState } from '../../state/tenant-read-state';
import { TenantEntitlementsState } from '../../state/tenant-entitlements-state';
import { TenantEditorState } from '../../state/tenant-editor-state';
import { TenantCollectionView } from '../../components/tenant-collection-view/tenant-collection-view';
import { TenantEditor } from '../../components/tenant-editor/tenant-editor';

type TenantView = 'grid' | 'cards';

@Component({
  selector: 'erp-tenant-management-page',
  providers: [
    TenantReadState,
    TenantEntitlementsState,
    TenantEditorState,
    CollectionRecordFeedback,
  ],
  imports: [PageHeader, FeedbackState, UiTextPipe, TenantCollectionView, TenantEditor],
  templateUrl: './tenant-management-page.html',
  styleUrl: './tenant-management-page.scss',
})
export class TenantManagementPage {
  private readonly exportCollection = viewChild(TenantCollectionView);
  readonly exportSource = computed(() =>
    ['grid', 'cards'].includes(this.view())
      ? this.reads.exportSource(this.exportCollection()?.columns() ?? [], this.locale.language())
      : null,
  );

  private readonly router = inject(Router);
  readonly reads = inject(TenantReadState);
  readonly catalog = inject(TenantEntitlementsState);
  readonly editor = inject(TenantEditorState);
  private readonly records = inject(CollectionRecordFeedback);
  private readonly notices = inject(FeedbackNotifications);
  readonly locale = inject(LocalizationRuntime);
  private readonly drafts = inject(UnsavedChanges);
  private readonly preference = createViewPreference<TenantView>({
    storageKey: 'erp-angular:views:tenants-view-layout',
    defaultValue: 'grid',
    allowedValues: () => this.views().map((view) => view.id),
    canSynchronize: () =>
      !this.editor.active() &&
      !this.editor.pending() &&
      !this.drafts.busy() &&
      !this.drafts.dirty(),
  });
  readonly view = this.preference.value;
  readonly toolbar = signal(true);
  readonly views = computed<readonly PageViewOption<TenantView>[]>(() => [
    { id: 'grid', label: this.locale.translate('views.grid'), icon: 'grid' },
    { id: 'cards', label: this.locale.translate('views.cards'), icon: 'cards' },
  ]);
  constructor() {
    void this.locale.loadNamespace('core');
    void this.locale.loadNamespace('platform-tenants');
    this.editor.saved.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event.mode === 'edit') this.records.edited(this.reads.source(), event.tenant.id);
      this.reads.refresh();
      this.notices.success(
        event.mode === 'create' ? 'tenantManagement.created' : 'tenantManagement.updated',
        'platform-tenants',
      );
    });
  }
  choose(value: string): void {
    if ((value === 'grid' || value === 'cards') && !this.editor.active() && !this.editor.pending())
      this.preference.choose(value);
  }
  create(): void {
    if (this.editor.canCreate() && !this.editor.active() && !this.editor.pending())
      void this.router.navigateByUrl('/super-admin/tenants/new');
  }
  refresh(): void {
    this.reads.refresh();
    this.catalog.refresh();
  }
  text(key: string): string {
    return this.locale.translate('tenantManagement.' + key, 'platform-tenants');
  }
}

import { viewChild } from '@angular/core';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { createViewPreference, UnsavedChanges } from '../../../../../shared/data/public-api';
import {
  CollectionRecordFeedback,
  FeedbackState,
  PageHeader,
  type PageViewOption,
} from '../../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../localization/public-api';
import { TenantReadState } from '../../state/tenant-read-state';
import { TenantEntitlementsState } from '../../state/tenant-entitlements-state';
import { TenantEditorState } from '../../state/tenant-editor-state';
import { TenantCollectionView } from '../../components/tenant-collection-view/tenant-collection-view';

type TenantView = 'grid' | 'cards';

@Component({
  selector: 'erp-tenant-management-page',
  providers: [
    TenantReadState,
    TenantEntitlementsState,
    TenantEditorState,
    CollectionRecordFeedback,
  ],
  imports: [PageHeader, FeedbackState, UiTextPipe, TenantCollectionView],
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
  private readonly returnedTenantId: unknown =
    this.router.currentNavigation()?.extras.state?.['editedTenantId'];
  private returnFeedbackApplied = false;
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
    effect(() => {
      const source = this.reads.source();
      if (
        !this.returnFeedbackApplied &&
        typeof this.returnedTenantId === 'string' &&
        source.kind === 'ready'
      ) {
        this.returnFeedbackApplied = true;
        if (source.result?.rows.some((row) => row.id === this.returnedTenantId))
          this.records.edited(source, this.returnedTenantId);
      }
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

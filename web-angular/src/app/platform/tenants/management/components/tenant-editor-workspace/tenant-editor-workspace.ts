import { Component, effect, inject, input, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthSession, type Session } from '../../../../auth/session.public-api';
import {
  FeedbackNotifications,
  FeedbackState,
  PageHeader,
  SurfaceCard,
  PopoverPanel,
  AppIcon,
} from '../../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../localization/public-api';
import { TenantEditorState } from '../../state/tenant-editor-state';
import { TenantEntitlementsState } from '../../state/tenant-entitlements-state';
import { TenantForm } from '../../components/tenant-form/tenant-form';
import { TenantDraftSummary } from '../../components/tenant-draft-summary/tenant-draft-summary';

@Component({
  imports: [
    FeedbackState,
    PageHeader,
    SurfaceCard,
    UiTextPipe,
    TenantForm,
    TenantDraftSummary,
    PopoverPanel,
    AppIcon,
  ],
  selector: 'erp-tenant-editor-workspace',
  providers: [TenantEditorState, TenantEntitlementsState],
  styleUrl: './tenant-editor-workspace.scss',
  templateUrl: './tenant-editor-workspace.html',
})
export class TenantEditorWorkspace {
  readonly tenantId = input<string | null>(null);
  readonly editor = inject(TenantEditorState);
  readonly catalog = inject(TenantEntitlementsState);
  readonly locale = inject(LocalizationRuntime);
  private readonly router = inject(Router);
  private readonly notices = inject(FeedbackNotifications);
  private readonly auth = inject(AuthSession);
  private startedFor: Session | null = null;
  constructor() {
    void this.locale.loadNamespace('core');
    void this.locale.loadNamespace('platform-tenants');
    effect(() => {
      const actor = this.auth.readIdentity();
      const tenantId = this.tenantId();
      if (
        actor &&
        actor !== this.startedFor &&
        this.catalog.ready() &&
        this.editor.canCreate() &&
        !this.editor.pending()
      ) {
        untracked(() => {
          if (tenantId === null) this.editor.create();
          else this.editor.edit(tenantId);
          if (this.editor.active()) this.startedFor = actor;
        });
      }
    });
    this.editor.saved.pipe(takeUntilDestroyed()).subscribe((event) => {
      this.notices.success(
        event.mode === 'edit' ? 'tenantManagement.updated' : 'tenantManagement.created',
        'platform-tenants',
      );
      this.back(event.mode === 'edit' ? event.tenant.id : null);
    });
  }
  back(editedTenantId: string | null = null): void {
    void this.router.navigateByUrl('/super-admin/tenants', {
      ...(editedTenantId ? { state: { editedTenantId } } : {}),
    });
  }
  text(key: string): string {
    return this.locale.translate('tenantManagement.' + key, 'platform-tenants');
  }
}

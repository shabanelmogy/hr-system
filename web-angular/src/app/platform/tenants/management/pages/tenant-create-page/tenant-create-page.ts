import { Component, effect, inject, untracked } from '@angular/core';
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
  ScrollViewport,
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
    ScrollViewport,
  ],
  selector: 'erp-tenant-create-page',
  providers: [TenantEditorState, TenantEntitlementsState],
  styleUrl: './tenant-create-page.scss',
  templateUrl: './tenant-create-page.html',
})
export class TenantCreatePage {
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
      if (
        actor &&
        actor !== this.startedFor &&
        this.catalog.ready() &&
        this.editor.canCreate() &&
        !this.editor.pending()
      ) {
        untracked(() => {
          this.editor.create();
          if (this.editor.active()) this.startedFor = actor;
        });
      }
    });
    this.editor.saved.pipe(takeUntilDestroyed()).subscribe(() => {
      this.notices.success('tenantManagement.created', 'platform-tenants');
      this.back();
    });
  }
  back(): void {
    void this.router.navigateByUrl('/super-admin/tenants');
  }
  text(key: string): string {
    return this.locale.translate('tenantManagement.' + key, 'platform-tenants');
  }
}

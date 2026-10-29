import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActionButton, PageHeader, SurfaceCard } from '../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../localization/public-api';
import { AuthSession } from '../state/auth-session';
import { tenantWorkspaceAllowed } from '../../modules/public-api';

@Component({ imports: [ActionButton, PageHeader, SurfaceCard, UiTextPipe], template: `
  @if (auth.user(); as user) {
    <erp-page-header [title]="'general.home' | uiText" [subtitle]="'dashboard.welcome' | uiText" />
    <erp-surface-card [title]="'angularAuth.sessionReady' | uiText:'platform-auth'">
    <p>{{ user.firstName }} {{ user.lastName }}</p><p>{{ user.userName }}</p>
    <p>{{ user.tenantName }}</p><p>{{ locale.language() === 'ar' ? user.companyNameAr : user.companyNameEn }}</p>
    @if(workspaceAllowed(auth.user())){<erp-button [label]="'modules.title' | uiText" fullWidth (activated)="openApplications()" />}
    <erp-button [label]="'angularAuth.signOut' | uiText:'platform-auth'" [busy]="auth.pending()" fullWidth (activated)="logout()" />
    </erp-surface-card>
  }`, styles: 'p{overflow-wrap:anywhere}erp-surface-card{max-width:720px}' })
export class SessionPage {
  readonly workspaceAllowed = tenantWorkspaceAllowed;
  readonly auth = inject(AuthSession); readonly locale = inject(LocalizationRuntime); private readonly router = inject(Router);
  constructor() { void Promise.all([this.locale.loadNamespace('core'), this.locale.loadNamespace('platform-auth')]); }
  openApplications(): void { if(this.workspaceAllowed(this.auth.user()))void this.router.navigateByUrl('/apps'); }
  async logout(): Promise<void> { await this.auth.logout(); await this.router.navigateByUrl('/login'); }
}

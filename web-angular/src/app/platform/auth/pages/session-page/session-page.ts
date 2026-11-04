import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActionButton, PageHeader, SurfaceCard } from '../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { AuthSession } from '../../state/auth-session';
import { tenantWorkspaceAllowed } from '../../../modules/public-api';

@Component({
  imports: [ActionButton, PageHeader, SurfaceCard, UiTextPipe],
  templateUrl: './session-page.html',
  styleUrl: './session-page.scss',
})
export class SessionPage {
  readonly workspaceAllowed = tenantWorkspaceAllowed;
  readonly auth = inject(AuthSession);
  readonly locale = inject(LocalizationRuntime);
  private readonly router = inject(Router);
  constructor() {
    void Promise.all([
      this.locale.loadNamespace('core'),
      this.locale.loadNamespace('platform-auth'),
    ]);
  }
  openApplications(): void {
    if (this.workspaceAllowed(this.auth.user())) void this.router.navigateByUrl('/apps');
  }
  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}

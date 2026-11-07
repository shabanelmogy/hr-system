import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthSession } from '../../../auth/session.public-api';
import {
  ContentTabs,
  FeedbackState,
  PageHeader,
  RecordSummary,
  ScrollViewport,
  SurfaceCard,
  type ContentTab,
  type RecordSummaryField,
} from '../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { AccountProfileState } from '../../state/account-profile-state';
import { PersonalInfo } from '../../components/personal-info/personal-info';
import { PasswordEditor } from '../../components/password-editor/password-editor';
import { PhotoEditor } from '../../components/photo-editor/photo-editor';

@Component({
  selector: 'erp-account-profile-page',
  providers: [AccountProfileState],
  imports: [
    ContentTabs,
    FeedbackState,
    PageHeader,
    PasswordEditor,
    PersonalInfo,
    PhotoEditor,
    RecordSummary,
    ScrollViewport,
    SurfaceCard,
    UiTextPipe,
  ],
  templateUrl: './account-profile-page.html',
  styleUrl: './account-profile-page.scss',
})
export class AccountProfilePage {
  readonly state = inject(AccountProfileState);
  readonly locale = inject(LocalizationRuntime);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthSession);
  readonly passwordOnly = this.route.snapshot.data['accountTab'] === 'password';
  readonly selected = signal(
    this.route.snapshot.data['accountTab'] === 'password' ? 'password' : 'personal',
  );
  readonly tabs = computed<readonly ContentTab[]>(() => [
    { id: 'personal', label: this.text('personalInfo') },
    { id: 'password', label: this.text('changePassword') },
  ]);
  readonly fields = computed<readonly RecordSummaryField[]>(() => [
    {
      id: 'email',
      label: this.locale.translate('auth.email', 'platform-auth'),
      value: this.state.info()?.email ?? '',
      direction: 'ltr',
    },
    {
      id: 'role',
      label: this.locale.translate('auth.roles', 'platform-auth'),
      value: this.auth.readIdentity()?.roles.join(', ') ?? '',
    },
  ]);
  constructor() {
    if (this.passwordOnly) this.state.usePasswordOnly();
    void this.locale.loadNamespace('platform-auth');
  }
  text(key: string): string {
    return this.locale.translate('accountProfile.' + key, 'platform-auth');
  }
  back(): void {
    void this.router.navigateByUrl('/home');
  }
  async selectTab(id: string): Promise<void> {
    if (id === this.selected() || !this.tabs().some((tab) => tab.id === id)) return;
    if (await this.state.discardForTab()) this.selected.set(id);
  }
}

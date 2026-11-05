import { afterNextRender, Component, computed, effect, inject, viewChild } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../../../shell/auth-layout.public-api';
import {
  ActionButton,
  AppIcon,
  ChoiceDialog,
  FormContainer,
  TextField,
} from '../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { AuthSession } from '../../state/auth-session';
import { createLoginForm, emptyLogin } from '../../validation/login-validation';

@Component({
  imports: [
    FormField,
    RouterLink,
    AuthLayout,
    ActionButton,
    AppIcon,
    ChoiceDialog,
    FormContainer,
    TextField,
    UiTextPipe,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  readonly locale = inject(LocalizationRuntime);
  readonly auth = inject(AuthSession);
  private readonly router = inject(Router);
  readonly form = createLoginForm({
    submission: { ignoreValidators: 'none', action: () => this.authenticate() },
  });
  readonly firstField = viewChild<TextField>('username');
  readonly messages = computed(() => ({
    required: this.locale.translate('validation.required'),
    minlength: this.locale.translate('validation.minLength', 'core', { count: 3 }),
    maxlength: this.locale.translate('validation.maxLength', 'core', { count: 50 }),
  }));
  readonly roles = [
    { id: 'user', key: 'auth.demoRoleUser', icon: 'user' as const },
    { id: 'admin', key: 'auth.demoRoleAdmin', icon: 'admin' as const },
    { id: 'superadmin', key: 'auth.demoRoleSuperAdmin', icon: 'award' as const },
  ];
  readonly selectionTitle = computed(() =>
    this.auth.challenge() && 'requiresTenantSelection' in this.auth.challenge()!
      ? 'auth.selectTenant'
      : 'auth.selectCompany',
  );
  readonly selectionDescription = computed(() =>
    this.auth.challenge() && 'requiresTenantSelection' in this.auth.challenge()!
      ? 'auth.selectTenantDescription'
      : 'auth.selectCompanyDescription',
  );
  readonly selectionContinue = computed(() =>
    this.auth.challenge() && 'requiresTenantSelection' in this.auth.challenge()!
      ? 'auth.continueToTenant'
      : 'auth.continueToCompany',
  );
  readonly selectionIdentity = computed(() => {
    const selection = this.auth.challenge();
    return selection
      ? 'requiresTenantSelection' in selection
        ? selection.tenantSelectionToken
        : selection.companySelectionToken
      : '';
  });
  readonly options = computed(() => {
    const selection = this.auth.challenge();
    if (!selection) return [];
    return 'requiresTenantSelection' in selection
      ? selection.tenants.map((value) => ({
          value: value.id,
          label: value.name,
          description: value.identifier,
        }))
      : selection.companies.map((value) => ({
          value: String(value.id),
          label: this.locale.language() === 'ar' ? value.nameAr : value.nameEn,
          description: value.companyCode,
        }));
  });
  constructor() {
    void Promise.all([
      this.locale.loadNamespace('core'),
      this.locale.loadNamespace('platform-auth'),
    ]);
    afterNextRender(() => this.firstField()?.focus());
    void this.auth.restore();
    effect(() => {
      if (this.auth.user() && !this.auth.pending() && !this.auth.restoring())
        void this.router.navigateByUrl('/home');
    });
  }
  async login(): Promise<void> {
    await submit(this.form);
  }
  private async authenticate(): Promise<void> {
    const values = this.form().value();
    const accepted = await this.auth.login({
      userName: values.username.trim(),
      password: values.password.trim(),
    });
    if (accepted) this.form().reset({ ...emptyLogin });
  }
  async demo(userName: string): Promise<void> {
    this.form().value.set({ username: userName, password: 'P@ssword123' });
    await this.login();
  }
  async select(id: string): Promise<void> {
    if (await this.auth.select(id)) this.form().reset({ ...emptyLogin });
  }
}

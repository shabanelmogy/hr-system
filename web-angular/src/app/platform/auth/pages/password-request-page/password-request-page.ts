import { Component, computed, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AuthLayout } from '../../../../shell/auth-layout.public-api';
import { FormContainer, TextField } from '../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { BrowserAuthService } from '../../services/browser-auth-service';
import { createPasswordRequestForm } from '../../validation/login-validation';

@Component({
  imports: [FormField, RouterLink, AuthLayout, FormContainer, TextField, UiTextPipe],
  templateUrl: './password-request-page.html',
  styleUrl: './password-request-page.scss',
})
export class PasswordRequestPage {
  private readonly service = inject(BrowserAuthService);
  private readonly locale = inject(LocalizationRuntime);
  readonly form = createPasswordRequestForm({
    submission: { ignoreValidators: 'none', action: () => this.sendRequest() },
  });
  readonly pending = computed(() => this.form().submitting());
  readonly feedback = signal('');
  readonly messages = computed(() => ({
    required: this.locale.translate('validation.required'),
    email: this.locale.translate('validation.invalidEmail'),
  }));
  constructor() {
    void Promise.all([
      this.locale.loadNamespace('core'),
      this.locale.loadNamespace('platform-auth'),
    ]);
  }
  async request(): Promise<void> {
    await submit(this.form);
  }
  private async sendRequest(): Promise<void> {
    this.feedback.set('');
    try {
      await this.service.requestPasswordReset(this.form().value().email.trim());
      this.feedback.set('angularAuth.passwordRequestSent');
      return;
    } catch {
      this.feedback.set('angularAuth.unavailable');
    }
  }
}

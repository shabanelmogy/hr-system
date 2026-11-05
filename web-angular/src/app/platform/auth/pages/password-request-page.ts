import { Component, computed, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AuthLayout } from '../../../shell/auth-layout.public-api';
import { FormContainer, TextField } from '../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../localization/public-api';
import { BrowserAuthService } from '../services/browser-auth-service';
import { createPasswordRequestForm } from '../validation/login-validation';

@Component({ imports: [FormField, RouterLink, AuthLayout, FormContainer, TextField, UiTextPipe], template: `
  <erp-auth-layout><erp-form [form]="form" [title]="'auth.doYouForgetPassword' | uiText:'platform-auth'"
    [submitLabel]="'auth.resetPassword' | uiText:'platform-auth'" appearance="plain" [submitFullWidth]="true" [pending]="pending()"
    [feedbackKind]="feedback() === 'angularAuth.passwordRequestSent' ? 'success' : 'error'"
    [feedback]="feedback() ? (feedback() | uiText:'platform-auth') : ''">
    <erp-text-field [formField]="form.email" [label]="'auth.email' | uiText:'platform-auth'" type="email" autocomplete="email" [messages]="messages()" />
  </erp-form><p><a routerLink="/login">{{ 'angularAuth.backToLogin' | uiText:'platform-auth' }}</a></p></erp-auth-layout>
  `, styles: 'erp-text-field{margin-bottom:1.5rem}a{color:var(--primary)}' })
export class PasswordRequestPage {
  private readonly service = inject(BrowserAuthService); private readonly locale = inject(LocalizationRuntime);
  readonly form = createPasswordRequestForm({ submission: { ignoreValidators: 'none', action: () => this.sendRequest() } }); readonly pending = computed(() => this.form().submitting()); readonly feedback = signal('');
  readonly messages = computed(() => ({ required: this.locale.translate('validation.required'), email: this.locale.translate('validation.invalidEmail') }));
  constructor() { void Promise.all([this.locale.loadNamespace('core'), this.locale.loadNamespace('platform-auth')]); }
  async request(): Promise<void> { await submit(this.form); }
  private async sendRequest():Promise<void> {
    this.feedback.set('');
    try { await this.service.requestPasswordReset(this.form().value().email.trim()); this.feedback.set('angularAuth.passwordRequestSent'); return; }
    catch { this.feedback.set('angularAuth.unavailable'); }
  }
}

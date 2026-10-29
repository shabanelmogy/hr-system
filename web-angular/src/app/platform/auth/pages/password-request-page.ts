import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthLayout } from '../../../shell/auth-layout/auth-layout';
import { FormContainer, TextField } from '../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../localization/public-api';
import { BrowserAuthService } from '../services/browser-auth-service';
import { createPasswordRequestForm } from '../validation/login-validation';

@Component({ imports: [ReactiveFormsModule, RouterLink, AuthLayout, FormContainer, TextField, UiTextPipe], template: `
  <erp-auth-layout><erp-form [form]="form" [title]="'auth.doYouForgetPassword' | uiText:'platform-auth'"
    [submitLabel]="'auth.resetPassword' | uiText:'platform-auth'" appearance="plain" [submitFullWidth]="true" [pending]="pending()"
    [feedbackKind]="feedback() === 'angularAuth.passwordRequestSent' ? 'success' : 'error'"
    [feedback]="feedback() ? (feedback() | uiText:'platform-auth') : ''" (validSubmit)="request()">
    <erp-text-field [formControl]="form.controls.email" [label]="'auth.email' | uiText:'platform-auth'" type="email" autocomplete="email" [messages]="messages()" />
  </erp-form><p><a routerLink="/login">{{ 'angularAuth.backToLogin' | uiText:'platform-auth' }}</a></p></erp-auth-layout>
  `, styles: 'erp-text-field{margin-bottom:1.5rem}a{color:var(--primary)}' })
export class PasswordRequestPage {
  private readonly service = inject(BrowserAuthService); private readonly locale = inject(LocalizationRuntime);
  readonly form = createPasswordRequestForm(); readonly pending = signal(false); readonly feedback = signal('');
  readonly messages = computed(() => ({ required: this.locale.translate('validation.required'), email: this.locale.translate('validation.invalidEmail') }));
  constructor() { void Promise.all([this.locale.loadNamespace('core'), this.locale.loadNamespace('platform-auth')]); }
  async request(): Promise<void> {
    if (this.pending()) return; this.pending.set(true); this.feedback.set('');
    try { await this.service.requestPasswordReset(this.form.getRawValue().email.trim()); this.feedback.set('angularAuth.passwordRequestSent'); }
    catch { this.feedback.set('angularAuth.unavailable'); }
    finally { this.pending.set(false); }
  }
}

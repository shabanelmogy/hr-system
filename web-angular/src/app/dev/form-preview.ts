import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { themePaletteOrder } from '@app/tokens';
import { LocalizationRuntime, UiTextPipe } from '../platform/localization/public-api';
import { ActionButton, applyServerFieldErrors, FormContainer, TextField } from '../shared/ui/public-api';
import { ThemeService } from '../../theme/public-api';
import { createAccessFixture, createProfileFixture } from './form-fixture-validation';

@Component({
  imports: [ReactiveFormsModule, ActionButton, FormContainer, TextField, UiTextPipe],
  template: `
    <main>
      @if (ready()) {
        <div class="preferences">
          @for (palette of palettes; track palette) {
            <erp-button [label]="('menu.palettes.' + palette) | uiText" severity="secondary"
              [pressed]="theme.palette() === palette" (activated)="theme.setPalette(palette)" />
          }
          <erp-button [label]="(theme.mode() === 'light' ? 'general.darkMode' : 'general.lightMode') | uiText" (activated)="theme.setMode(theme.mode() === 'light' ? 'dark' : 'light')" />
          <erp-button [label]="(runtime.language() === 'en' ? 'common.arabic' : 'common.english') | uiText" data-testid="language"
            (activated)="runtime.setLanguage(runtime.language() === 'en' ? 'ar' : 'en')" />
        </div>
        <div class="compositions">
          <erp-form [form]="access" [title]="'auth.signIn' | uiText:'platform-auth'" [submitLabel]="'common.save' | uiText"
            [pending]="pending()" (validSubmit)="saved.set(saved() + 1); pending.set(true)" data-testid="access">
            <erp-text-field [formControl]="access.controls.email" [label]="'auth.email' | uiText:'platform-auth'"
              [messages]="messages()" [help]="'validation.invalidEmail' | uiText" type="email" autocomplete="username" required data-testid="email" />
            <erp-text-field [formControl]="access.controls.password" [label]="'auth.password' | uiText:'platform-auth'"
              [messages]="messages()" type="password" autocomplete="new-password" required data-testid="password" />
            <erp-button formActions [label]="'general.reset' | uiText" severity="secondary" data-testid="reset"
              (activated)="access.reset(); pending.set(false)" />
          </erp-form>
          <erp-form [form]="profile" [title]="'general.profile' | uiText" [submitLabel]="'common.saveChanges' | uiText"
            (validSubmit)="saved.set(saved() + 1)" data-testid="profile">
            <div>
              <erp-text-field [formControl]="profile.controls.profile.controls.name" [label]="'general.nameEn' | uiText"
                [messages]="messages()" required data-testid="name" />
            </div>
            <erp-button formActions [label]="'common.validationErrors' | uiText" severity="secondary" data-testid="server-error" (activated)="serverError()" />
            <erp-button formActions [label]="'actions.editInformation' | uiText" severity="secondary" data-testid="async-patch" (activated)="patch()" />
          </erp-form>
        </div>
        <output data-testid="saved">{{ saved() }}</output>
      }
    </main>
  `,
  styles: `
    main { max-inline-size: var(--wide-content-max-width); margin-inline: auto; padding: 1.5rem; }
    .preferences { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-block-end: 1.5rem; }
    .compositions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; align-items: start; }
    output { display: block; margin-block-start: 1rem; }
    @media(max-width: 48rem) { main { padding: 1rem; } .compositions { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class FormPreview {
  readonly runtime = inject(LocalizationRuntime);
  readonly theme = inject(ThemeService);
  readonly palettes = themePaletteOrder;
  readonly ready = signal(false);
  readonly access = createAccessFixture();
  readonly profile = createProfileFixture();
  readonly pending = signal(false);
  readonly saved = signal(0);
  readonly messages = computed(() => ({ required: this.runtime.translate('validation.required'), email: this.runtime.translate('validation.invalidEmail'), minlength: this.runtime.translate('validation.invalidPassword') }));
  constructor() { void Promise.all([this.runtime.loadNamespace('core'), this.runtime.loadNamespace('platform-auth')]).then(() => this.ready.set(true)); }
  serverError(): void { applyServerFieldErrors(this.profile, { 'profile.name': this.runtime.translate('validation.required') }); }
  patch(): void { void Promise.resolve().then(() => this.profile.patchValue({ profile: { name: 'Asynchronous fixture' } })); }
}

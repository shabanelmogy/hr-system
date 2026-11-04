import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthSession } from '../../platform/auth/session.public-api';
import {
  FiscalContextControl,
  FiscalContextState,
} from '../../modules/accounting/fiscal-year-context/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import { UnsavedChanges } from '../../shared/data/public-api';
import { ActionButton, FormContainer, OptionSelect, TextField } from '../../shared/ui/public-api';

/** Actual session/year owners with a neutral registered draft; API is intercepted in acceptance. */
@Component({
  providers: [FiscalContextState],
  imports: [
    ReactiveFormsModule,
    FiscalContextControl,
    ActionButton,
    FormContainer,
    OptionSelect,
    TextField,
    UiTextPipe,
  ],
  templateUrl: './unsaved-context-preview.html',
  styleUrl: './unsaved-context-preview.scss',
})
export class UnsavedContextPreview {
  readonly auth = inject(AuthSession);
  readonly year = inject(FiscalContextState);
  readonly drafts = inject(UnsavedChanges);
  readonly locale = inject(LocalizationRuntime);
  readonly active = signal(true);
  readonly busy = signal(false);
  readonly value = signal('');
  readonly baseline = signal('');
  readonly revision = signal(0);
  readonly quarantined = signal(0);
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  readonly companies = computed(
    () =>
      this.auth.user()?.companies.map((company) => ({
        value: String(company.id),
        label: this.locale.language() === 'ar' ? company.nameAr : company.nameEn,
      })) ?? [],
  );
  readonly messages = () => ({ required: this.locale.translate('validation.required') });
  private cleanup: () => void = () => {};
  constructor() {
    const destroy = inject(DestroyRef);
    void this.locale.loadNamespace('platform-auth');
    void this.locale.loadNamespace('core');
    this.form.valueChanges.pipe(takeUntilDestroyed(destroy)).subscribe(() => {
      this.value.set(this.form.controls.name.value);
      this.revision.update((value) => value + 1);
    });
    this.register();
    destroy.onDestroy(() => this.cleanup());
  }
  private register(): void {
    this.cleanup = this.drafts.register({
      read: () => ({
        identity: 'context-fixture',
        revision: this.revision(),
        active: this.active(),
        unsaved: this.value() !== this.baseline(),
        pending: this.busy(),
      }),
      invalidate: () => {
        this.quarantined.update((value) => value + 1);
        this.active.set(false);
      },
    });
  }
  reopen(): void {
    this.cleanup();
    this.form.reset({ name: '' });
    this.baseline.set('');
    this.busy.set(false);
    this.active.set(true);
    this.register();
  }
}

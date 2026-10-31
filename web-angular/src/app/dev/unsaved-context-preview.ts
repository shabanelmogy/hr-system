import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthSession } from '../platform/auth/session.public-api';
import { FiscalContextControl, FiscalContextState } from '../modules/accounting/fiscal-year-context/public-api';
import { LocalizationRuntime, UiTextPipe } from '../platform/localization/public-api';
import { UnsavedChanges } from '../shared/data/public-api';
import { ActionButton, FormContainer, OptionSelect, TextField } from '../shared/ui/public-api';

/** Actual session/year owners with a neutral registered draft; API is intercepted in acceptance. */
@Component({ providers: [FiscalContextState], imports: [ReactiveFormsModule, FiscalContextControl, ActionButton, FormContainer, OptionSelect, TextField, UiTextPipe], template: `
  <main>
    <div class="contexts">
      <erp-option-select [label]="'auth.currentCompany'|uiText:'platform-auth'" [value]="''+(auth.user()?.companyId??'')" [options]="companies()"
        [disabled]="auth.pending()" commitMode="external" (valueChange)="auth.switchCompany(+$event)" data-testid="company" />
      <erp-fiscal-context />
      <erp-button [label]="'auth.logout'|uiText:'platform-auth'" [busy]="auth.pending()" (activated)="auth.logout()" data-testid="logout" />
      <erp-button [label]="'common.loading'|uiText" [pressed]="busy()" (activated)="busy.set(!busy())" data-testid="busy" />
      <erp-button [label]="'actions.add'|uiText" (activated)="reopen()" data-testid="reopen" />
    </div>
    @if(active()) {
      <erp-form [form]="form" [title]="'general.profile'|uiText" [submitLabel]="'common.save'|uiText" [pending]="busy()" (validSubmit)="baseline.set(value())">
        <erp-text-field [formControl]="form.controls.name" [label]="'general.nameEn'|uiText" [messages]="messages()" [readOnly]="busy()||auth.pending()" required data-testid="name" />
      </erp-form>
    }
    <output data-testid="context-state" [attr.data-active]="active()" [attr.data-company]="auth.user()?.companyId??''" [attr.data-year]="year.context()?.selectedFiscalYear?.id??''"
      [attr.data-pending]="auth.pending()" [attr.data-quarantined]="quarantined()" [attr.data-dirty]="drafts.dirty()"></output>
  </main>`, styles: `main{padding:20px;max-width:1000px;margin-inline:auto}.contexts{display:flex;flex-wrap:wrap;align-items:center;gap:16px;margin-bottom:24px}.contexts erp-option-select{min-width:180px}` })
export class UnsavedContextPreview {
  readonly auth = inject(AuthSession); readonly year = inject(FiscalContextState); readonly drafts = inject(UnsavedChanges);
  readonly locale = inject(LocalizationRuntime); readonly active = signal(true); readonly busy = signal(false);
  readonly value = signal(''); readonly baseline = signal(''); readonly revision = signal(0); readonly quarantined = signal(0);
  readonly form = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: Validators.required }) });
  readonly companies = computed(() => this.auth.user()?.companies.map(company => ({ value: String(company.id), label: this.locale.language() === 'ar' ? company.nameAr : company.nameEn })) ?? []);
  readonly messages = () => ({ required: this.locale.translate('validation.required') });
  private cleanup: () => void = () => {};
  constructor() {
    const destroy = inject(DestroyRef); void this.locale.loadNamespace('platform-auth'); void this.locale.loadNamespace('core');
    this.form.valueChanges.pipe(takeUntilDestroyed(destroy)).subscribe(() => { this.value.set(this.form.controls.name.value); this.revision.update(value => value + 1); });
    this.register(); destroy.onDestroy(() => this.cleanup());
  }
  private register(): void {
    this.cleanup = this.drafts.register({ read: () => ({ identity: 'context-fixture', revision: this.revision(), active: this.active(), unsaved: this.value() !== this.baseline(), pending: this.busy() }),
      invalidate: () => { this.quarantined.update(value => value + 1); this.active.set(false); } });
  }
  reopen(): void { this.cleanup(); this.form.reset({ name: '' }); this.baseline.set(''); this.busy.set(false); this.active.set(true); this.register(); }
}

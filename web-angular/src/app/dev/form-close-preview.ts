import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { themePaletteOrder } from '@app/tokens';
import { LocalizationRuntime, UiTextPipe } from '../platform/localization/public-api';
import { ThemeService } from '../../theme/public-api';
import { ActionButton, applyServerFieldErrors, DialogPanel, FormCloseGuard, FormContainer, PageHeader,
  ReferenceField, TextField, type CloseConsent, type ReferenceSource } from '../shared/ui/public-api';

@Component({
  imports: [NgTemplateOutlet, ReactiveFormsModule, ActionButton, DialogPanel, FormCloseGuard, FormContainer, PageHeader, ReferenceField, TextField, UiTextPipe],
  template: `
    <main><erp-page-header [title]="'messages.unsavedChangesTitle' | uiText" />
      <div class="tools">
        @for (palette of palettes; track palette) { <erp-button [label]="('menu.palettes.' + palette) | uiText" [attr.data-palette]="palette" (activated)="theme.setPalette(palette)" /> }
        <erp-button [label]="(theme.mode()==='light'?'general.darkMode':'general.lightMode') | uiText" (activated)="theme.setMode(theme.mode()==='light'?'dark':'light')" />
        <erp-button [label]="(runtime.language()==='en'?'common.arabic':'common.english') | uiText" (activated)="runtime.setLanguage(runtime.language()==='en'?'ar':'en')" />
        <erp-button [label]="'actions.add' | uiText" data-testid="reopen" (activated)="reopen()" />
        <erp-button [label]="'common.loading' | uiText" data-testid="pending" [pressed]="pending()" (activated)="pending.set(!pending())" />
        <erp-button [label]="'common.error' | uiText" data-testid="fail" [pressed]="fail()" (activated)="fail.set(!fail())" />
        <erp-button [label]="'actions.view' | uiText" data-testid="nested" [pressed]="nested()" (activated)="nested.set(!nested())" />
        <erp-button [label]="'actions.editInformation' | uiText" data-testid="arm-revision" (activated)="later('revision')" />
        <erp-button [label]="'general.reset' | uiText" data-testid="arm-owner" (activated)="later('owner')" />
        <erp-button [label]="'actions.retry' | uiText" data-testid="arm-pending" (activated)="later('pending')" />
        <erp-button [label]="'actions.view' | uiText" data-testid="long" [pressed]="long()" (activated)="long.set(!long())" />
      </div>
      @if (active()) {
        @if (nested()) {
          <erp-dialog-panel [open]="true" [title]="'general.profile' | uiText" [closeLabel]="'common.close' | uiText"
            [pending]="pending() || (entryForm()?.checking() ?? false)" (closeRequested)="guard.requestClose()">
            <ng-container [ngTemplateOutlet]="editor" />
          </erp-dialog-panel>
        } @else { <ng-container [ngTemplateOutlet]="editor" /> }
      }
      <ng-template #editor>
        <erp-form [form]="form" [title]="'general.profile' | uiText" [hideHeader]="nested()" [submitLabel]="'common.save' | uiText"
          [pending]="pending()" [feedback]="feedback()" (validSubmit)="save()" data-testid="editor">
          <erp-text-field [formControl]="form.controls.name" [label]="'general.nameEn' | uiText" required [readOnly]="pending()" [messages]="messages()" data-testid="name" />
          <erp-reference-field [formControl]="form.controls.reference" [label]="'reference.currentSelection' | uiText" required
            [source]="options" [searchable]="false" [readOnly]="pending()" [messages]="messages()" data-testid="reference" />
          @if (long()) { <div class="long-copy">@for (item of longItems; track item) { <p>{{ 'messages.unsavedChangesConfirm' | uiText }}</p> }</div> }
          <erp-button formActions [label]="'actions.cancel' | uiText" data-testid="close" [disabled]="pending() || (entryForm()?.checking() ?? false)" (activated)="guard.requestClose()" />
        </erp-form>
      </ng-template>
      <erp-form-close-guard #guard [identity]="identity()" [revision]="revision()" [active]="active()" [unsaved]="unsaved()"
        [pending]="pending() || (entryForm()?.checking() ?? false)" (closed)="close($event)" />
      <output data-testid="state" [attr.data-active]="active()" [attr.data-dirty]="unsaved()" [attr.data-revision]="revision()"
        [attr.data-owner]="identity()" [attr.data-pending]="pending()" [attr.data-closed]="closed()" [attr.data-saved]="saved()" [attr.data-attempts]="attempts()"></output>
    </main>
  `,
  styles: `main{padding:24px;max-width:1100px;margin-inline:auto;min-width:0}.tools{display:flex;flex-wrap:wrap;gap:8px;margin-block:24px}.long-copy{overflow-wrap:anywhere}output{display:block;margin-top:16px}@media(max-width:599px){main{padding:12px}}`,
})
export class FormClosePreview {
  readonly runtime = inject(LocalizationRuntime);
  readonly theme = inject(ThemeService);
  readonly palettes = themePaletteOrder;
  readonly form = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: Validators.required }), reference: new FormControl<number | null>(null, Validators.required) });
  readonly options: ReferenceSource = { query: { scopeKey: 'neutral', search: '' }, kind: 'ready', result: { query: { scopeKey: 'neutral', search: '' }, options: [{ value: 0, label: '0 · A' }, { value: 1, label: '1 · B' }], hasMore: false } };
  readonly identity = signal('editor-1'); readonly revision = signal(0); readonly active = signal(true);
  readonly pending = signal(false); readonly fail = signal(false); readonly nested = signal(false); readonly long = signal(false);
  readonly feedback = signal(''); readonly closed = signal(0); readonly saved = signal(0); readonly attempts = signal(0);
  readonly entryForm = viewChild(FormContainer);
  readonly longItems = Array.from({ length: 24 }, (_, index) => index);
  private readonly value = signal(this.form.getRawValue()); private readonly baseline = signal(JSON.stringify(this.value()));
  readonly unsaved = computed(() => JSON.stringify(this.value()) !== this.baseline());
  readonly messages = computed(() => ({ required: this.runtime.translate('validation.required') }));
  private epoch = 1; private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  constructor() {
    void this.runtime.loadNamespace('core');
    const destroy = inject(DestroyRef);
    this.form.valueChanges.pipe(takeUntilDestroyed(destroy)).subscribe(() => { this.value.set(this.form.getRawValue()); this.revision.update(value => value + 1); });
    destroy.onDestroy(() => { for (const timer of this.timers) clearTimeout(timer); });
  }
  private schedule(callback: () => void, ms: number): void {
    const timer = setTimeout(() => { this.timers.delete(timer); callback(); }, ms); this.timers.add(timer);
  }
  later(kind: 'revision' | 'owner' | 'pending'): void {
    this.schedule(() => { if (kind === 'owner') this.reopen(); else if (kind === 'pending') this.pending.set(true); else this.form.controls.name.setValue('Revised fixture'); }, 1300);
  }
  reopen(): void {
    this.identity.set('editor-' + ++this.epoch); this.pending.set(false); this.feedback.set('');
    this.form.reset({ name: '', reference: null }); this.baseline.set(JSON.stringify(this.form.getRawValue())); this.active.set(true);
  }
  close(consent: CloseConsent): void {
    if (consent.identity !== this.identity() || consent.revision !== this.revision() || this.pending() || !this.active()) return;
    this.closed.update(value => value + 1); this.active.set(false);
  }
  save(): void {
    if (this.pending()) return;
    const identity = this.identity(), revision = this.revision(); this.attempts.update(value => value + 1); this.pending.set(true); this.feedback.set('');
    this.schedule(() => {
      if (identity !== this.identity()) return;
      this.pending.set(false);
      if (this.fail()) { applyServerFieldErrors(this.form, { name: this.runtime.translate('validation.required') }); this.feedback.set(this.runtime.translate('common.error')); return; }
      if (revision === this.revision()) { this.baseline.set(JSON.stringify(this.form.getRawValue())); this.form.markAsPristine(); this.saved.update(value => value + 1); }
    }, 700);
  }
}

import { Component, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../theme/public-api';
import { LocalizationRuntime, UiTextPipe } from '../platform/localization/public-api';
import { UnsavedChanges } from '../shared/data/public-api';
import { ActionButton, FormContainer, PageHeader, TextField } from '../shared/ui/public-api';

@Injectable({ providedIn: 'root' })
export class UnsavedFixtureState { readonly alive = signal(0); readonly stopped = signal(0); }
@Component({ selector:'erp-unsaved-preview-frame', imports: [RouterOutlet], template: '<router-outlet />' })
export class UnsavedPreviewFrame {}

@Component({ imports: [ReactiveFormsModule, RouterLink, ActionButton, FormContainer, TextField, PageHeader, UiTextPipe], template: `
  <main><erp-page-header [title]="'messages.unsavedChangesTitle' | uiText" />
    <div class="tools">
      @for(palette of palettes; track palette){<erp-button [label]="('menu.palettes.'+palette)|uiText" [attr.data-palette]="palette" (activated)="theme.setPalette(palette)" />}
      <erp-button [label]="(locale.language()==='en'?'common.arabic':'common.english')|uiText" (activated)="locale.setLanguage(locale.language()==='en'?'ar':'en')" />
      <erp-button [label]="(theme.mode()==='light'?'general.darkMode':'general.lightMode')|uiText" (activated)="theme.setMode(theme.mode()==='light'?'dark':'light')" />
      <erp-button [label]="'common.loading'|uiText" data-testid="busy" [pressed]="busy()" (activated)="busy.set(!busy())" />
      <erp-button [label]="'actions.editInformation'|uiText" data-testid="arm-change" (activated)="arm()" />
      <a [routerLink]="['/dev/unsaved',record()]" [queryParams]="{q:'next'}" fragment="section" data-testid="query">{{ 'general.search'|uiText }}</a>
      <a [routerLink]="['/dev/unsaved',record()==='1'?'2':'1']" data-testid="record">{{ 'actions.edit'|uiText }}</a>
      <a [routerLink]="['/dev/unsaved',record(),{mode:'edit'}]" data-testid="matrix">{{ 'actions.view'|uiText }}</a>
      <a routerLink="/dev/unsaved-destination" data-testid="leave">{{ 'actions.close'|uiText }}</a>
      <a routerLink="/dev/unsaved-denied" data-testid="denied">{{ 'authorization.forbidden.title'|uiText }}</a>
    </div>
    <erp-form [form]="form" [title]="'general.profile'|uiText" [submitLabel]="'common.save'|uiText" [pending]="busy()" (validSubmit)="save()">
      <erp-text-field [formControl]="form.controls.name" [label]="'general.nameEn'|uiText" [readOnly]="busy()" [messages]="messages()" required data-testid="name" />
    </erp-form>
    <output data-testid="unsaved-state" [attr.data-record]="record()" [attr.data-revision]="revision()" [attr.data-busy]="busy()" [attr.data-alive]="lifetime.alive()" [attr.data-stopped]="lifetime.stopped()" [attr.data-path]="router.url"></output>
  </main>`, styles: `main{padding:24px;max-width:1100px;margin-inline:auto;min-width:0}.tools{display:flex;flex-wrap:wrap;gap:12px;margin-block:24px}.tools a{color:var(--primary);padding:12px} @media(max-width:599px){main{padding:12px}}` })
export class UnsavedPreview {
  readonly locale = inject(LocalizationRuntime); readonly theme = inject(ThemeService); readonly palettes = themePaletteOrder;
  readonly router = inject(Router); readonly lifetime = inject(UnsavedFixtureState);
  readonly form = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: Validators.required }) });
  readonly record = signal(''); readonly revision = signal(0); readonly busy = signal(false); readonly baseline = signal('');
  readonly value = signal(''); readonly messages = () => ({ required: this.locale.translate('validation.required') });
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  constructor() {
    const destroy = inject(DestroyRef); const drafts = inject(UnsavedChanges);
    void this.locale.loadNamespace('core'); this.lifetime.alive.update(value => value + 1);
    this.form.valueChanges.pipe(takeUntilDestroyed(destroy)).subscribe(() => { this.value.set(this.form.controls.name.value); this.revision.update(value => value + 1); });
    inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(destroy)).subscribe(params => {
      this.record.set(params.get('record') ?? ''); this.form.reset({ name: '' }); this.baseline.set('');
    });
    const unregister = drafts.register({
      read: () => ({ identity: 'fixture:' + this.record(), revision: this.revision(), active: true, unsaved: this.value() !== this.baseline(), pending: this.busy() }),
      invalidate: () => { this.form.disable(); this.busy.set(true); },
    });
    destroy.onDestroy(() => { unregister(); this.lifetime.alive.update(value => value - 1); this.lifetime.stopped.update(value => value + 1); for (const timer of this.timers) clearTimeout(timer); });
  }
  arm(): void { const timer = setTimeout(() => { this.timers.delete(timer); this.form.controls.name.setValue('Revised fixture'); }, 1400); this.timers.add(timer); }
  save(): void { this.baseline.set(this.form.controls.name.value); this.form.markAsPristine(); }
}

@Component({ imports: [RouterLink, UiTextPipe], template: '<main><a routerLink="/dev/unsaved/1" data-testid="return">{{"actions.edit"|uiText}}</a><output data-testid="destination" [attr.data-alive]="state.alive()" [attr.data-stopped]="state.stopped()"></output></main>' })
export class UnsavedDestination { readonly state = inject(UnsavedFixtureState); }

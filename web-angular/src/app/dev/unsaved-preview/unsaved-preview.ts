import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../../theme/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import { UnsavedChanges } from '../../shared/data/public-api';
import { ActionButton, FormContainer, PageHeader, TextField } from '../../shared/ui/public-api';
import { UnsavedFixtureState } from '../unsaved-fixture-state';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ActionButton,
    FormContainer,
    TextField,
    PageHeader,
    UiTextPipe,
  ],
  templateUrl: './unsaved-preview.html',
  styleUrl: './unsaved-preview.scss',
})
export class UnsavedPreview {
  readonly locale = inject(LocalizationRuntime);
  readonly theme = inject(ThemeService);
  readonly palettes = themePaletteOrder;
  readonly router = inject(Router);
  readonly lifetime = inject(UnsavedFixtureState);
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  readonly record = signal('');
  readonly revision = signal(0);
  readonly busy = signal(false);
  readonly baseline = signal('');
  readonly value = signal('');
  readonly messages = () => ({ required: this.locale.translate('validation.required') });
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  constructor() {
    const destroy = inject(DestroyRef);
    const drafts = inject(UnsavedChanges);
    void this.locale.loadNamespace('core');
    this.lifetime.alive.update((value) => value + 1);
    this.form.valueChanges.pipe(takeUntilDestroyed(destroy)).subscribe(() => {
      this.value.set(this.form.controls.name.value);
      this.revision.update((value) => value + 1);
    });
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed(destroy))
      .subscribe((params) => {
        this.record.set(params.get('record') ?? '');
        this.form.reset({ name: '' });
        this.baseline.set('');
      });
    const unregister = drafts.register({
      read: () => ({
        identity: 'fixture:' + this.record(),
        revision: this.revision(),
        active: true,
        unsaved: this.value() !== this.baseline(),
        pending: this.busy(),
      }),
      invalidate: () => {
        this.form.disable();
        this.busy.set(true);
      },
    });
    destroy.onDestroy(() => {
      unregister();
      this.lifetime.alive.update((value) => value - 1);
      this.lifetime.stopped.update((value) => value + 1);
      for (const timer of this.timers) clearTimeout(timer);
    });
  }
  arm(): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      this.form.controls.name.setValue('Revised fixture');
    }, 1400);
    this.timers.add(timer);
  }
  save(): void {
    this.baseline.set(this.form.controls.name.value);
    this.form.markAsPristine();
  }
}

import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, finalize, takeUntil, type Observable } from 'rxjs';
import { AuthSession } from '../../../../platform/auth/session.public-api';
import { createScopedRead, downloadBlob, UnsavedChanges } from '../../../../shared/data/public-api';
import { applyServerFieldErrors, clearServerFieldError } from '../../../../shared/ui/public-api';
import { GlobalTemplateService, globalTemplateError } from '../services/global-template-service';
import { GlobalTemplateViewState } from './global-template-view-state';
import {
  globalTemplateAllowed,
  globalTemplateManagerAllowed,
  type GlobalTemplateDetail,
} from '../types/global-template';

@Injectable()
export class GlobalTemplateDesignState {
  readonly views = inject(GlobalTemplateViewState);
  private readonly auth = inject(AuthSession);
  private readonly service = inject(GlobalTemplateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly unsaved = inject(UnsavedChanges);
  readonly identity = computed(() => this.auth.readIdentity());
  private readonly identityChanges = toObservable(this.identity);
  readonly opened = signal(false);
  readonly pending = signal(false);
  readonly feedback = signal<ReturnType<typeof globalTemplateError> | null>(null);
  readonly revision = signal(0);
  readonly form = new FormGroup({
    viewName: new FormControl<string | null>(null, {
      validators: [
        Validators.required,
        Validators.maxLength(257),
        Validators.pattern(/^[A-Za-z_][A-Za-z0-9_]{0,127}\.[A-Za-z_][A-Za-z0-9_]{0,127}$/),
      ],
    }),
    moduleKey: new FormControl<string | null>(null, Validators.required),
    sourceKey: new FormControl<string | null>(null, Validators.required),
    reportKey: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(128),
        Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      ],
    }),
    displayName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200), Validators.pattern(/\S/)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });
  private readonly values = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
  private readonly readScope = computed(() => (this.opened() ? this.identity() : null));
  private readonly read = createScopedRead(this.readScope, globalTemplateManagerAllowed, () =>
    this.service.designSources(),
  );
  readonly catalogState = this.read.state;
  readonly sources = computed(() => {
    const state = this.catalogState();
    return state.kind === 'ready'
      ? state.data.filter((source) =>
          globalTemplateAllowed(this.identity(), source.sourceKey, 'Create'),
        )
      : [];
  });
  readonly moduleKey = computed(() => this.values().moduleKey ?? null);
  readonly selectedSource = computed(
    () =>
      this.sources().find(
        (source) =>
          source.moduleKey === this.moduleKey() && source.sourceKey === this.values().sourceKey,
      ) ?? null,
  );
  readonly providerBound = computed(() => this.selectedSource()?.bindingKind === 'provider');
  readonly canDownload = computed(() => {
    const source = this.selectedSource();
    return !!source && globalTemplateAllowed(this.identity(), source.sourceKey, 'Download');
  });

  constructor() {
    effect(() =>
      this.views.bind(
        this.identity(),
        this.opened() && !this.providerBound() ? (this.selectedSource()?.sourceKey ?? null) : null,
      ),
    );
    this.form.controls.viewName.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.views.remember(value));
    this.form.controls.reportKey.addValidators((control) => {
      const key: unknown = control.value;
      const source = this.form.controls.sourceKey.value;
      return source && typeof key === 'string' && key !== source && !key.startsWith(source + '-')
        ? { sourcePrefix: true }
        : null;
    });
    this.form.controls.moduleKey.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.form.controls.sourceKey.reset();
    });
    this.form.controls.sourceKey.valueChanges.pipe(takeUntilDestroyed()).subscribe((key) => {
      this.form.controls.viewName.reset();
      const source = this.sources().find(
        (item) => item.sourceKey === key && item.moduleKey === this.form.controls.moduleKey.value,
      );
      if (source?.bindingKind === 'provider') this.form.controls.viewName.disable();
      else this.form.controls.viewName.enable();
      if (source && !this.form.controls.reportKey.dirty)
        this.form.controls.reportKey.setValue(source.sourceKey + '-');
      this.form.controls.reportKey.updateValueAndValidity();
    });
    effect(() => {
      this.identity();
      this.opened.set(false);
      this.pending.set(false);
      this.feedback.set(null);
      this.form.reset();
    });
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.revision.update((value) => value + 1);
      for (const control of Object.values(this.form.controls)) clearServerFieldError(control);
    });
    const unregister = this.unsaved.register({
      read: () => ({
        identity: 'global-template-design',
        revision: this.revision(),
        active: this.opened(),
        unsaved: this.form.dirty,
        pending: this.pending(),
      }),
      invalidate: () => this.close(),
    });
    this.destroyRef.onDestroy(unregister);
  }

  open(): void {
    if (!globalTemplateManagerAllowed(this.identity()) || this.pending()) return;
    this.form.reset();
    this.feedback.set(null);
    this.opened.set(true);
    this.read.invalidate();
  }
  close(): void {
    if (this.pending()) return;
    this.opened.set(false);
    this.form.reset();
    this.feedback.set(null);
  }
  reload(): void {
    this.read.invalidate();
  }
  save(created: (detail: GlobalTemplateDetail) => void): void {
    this.form.markAllAsTouched();
    const source = this.selectedSource();
    if (
      !this.opened() ||
      this.form.invalid ||
      !source ||
      !globalTemplateAllowed(this.identity(), source.sourceKey, 'Create')
    )
      return;
    const values = this.form.getRawValue();
    if (
      !this.providerBound() &&
      (!values.viewName ||
        this.views.selected()?.viewName !== values.viewName ||
        !this.views.selected()?.isCompatible)
    )
      return;
    if (
      values.reportKey !== source.sourceKey &&
      !values.reportKey.startsWith(source.sourceKey + '-')
    ) {
      this.form.controls.reportKey.setErrors({ sourcePrefix: true });
      return;
    }
    this.run(
      this.service.createDraft({
        viewName: values.viewName ?? '',
        moduleKey: source.moduleKey,
        sourceKey: source.sourceKey,
        reportKey: values.reportKey,
        displayName: values.displayName.trim(),
        description: values.description.trim(),
        contractFingerprint: source.contractFingerprint,
      }),
      (detail) => {
        this.opened.set(false);
        this.form.reset();
        created(detail);
      },
    );
  }
  downloadPackage(): void {
    const source = this.selectedSource();
    if (source && this.canDownload())
      this.run(this.service.designerPackage(source.sourceKey), (blob) =>
        downloadBlob(blob, source.sourceKey + '-designer.zip'),
      );
  }
  refreshViews(): void {
    this.form.controls.viewName.reset();
    this.views.refresh();
  }
  private run<T>(request: Observable<T>, success: (value: T) => void): void {
    const actor = this.identity();
    if (!actor || this.pending()) return;
    this.pending.set(true);
    this.feedback.set(null);
    request
      .pipe(
        takeUntil(this.identityChanges.pipe(filter((current) => current !== actor))),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.identity() === actor) this.pending.set(false);
        }),
      )
      .subscribe({
        next: (value) => {
          if (this.identity() === actor && this.opened()) success(value);
        },
        error: (error: unknown) => {
          if (this.identity() !== actor) return;
          const feedback = globalTemplateError(error);
          applyServerFieldErrors(this.form, feedback.fields);
          this.feedback.set(feedback);
        },
      });
  }
}

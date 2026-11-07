import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import type { AbstractControl } from '@angular/forms';
import {
  submit as submitSignalForm,
  type FieldTree,
  type ReadonlyFieldTree,
} from '@angular/forms/signals';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';
import { ActionButton } from '../../buttons/public-api';
import { UI_LOCALIZATION } from '../../../localization/public-api';
import { FormFieldRegistry, type RegisteredFormField } from '../form-field-registry';
import { ValidationSummary } from '../validation-summary/validation-summary';
import { ScrollViewport } from '../../layout/scroll-viewport/scroll-viewport';

@Component({
  selector: 'erp-form',
  imports: [ActionButton, NgTemplateOutlet, ValidationSummary, ScrollViewport],
  host: { '[class.filled-form]': 'fillContent()' },
  providers: [FormFieldRegistry],
  templateUrl: './form-container.html',
  styleUrl: './form-container.scss',
})
export class FormContainer {
  readonly form = input.required<AbstractControl | FieldTree<unknown>>();
  readonly title = input.required<string>();
  readonly submitLabel = input.required<string>();
  readonly feedback = input('');
  readonly feedbackKind = input<'error' | 'success' | 'info'>('error');
  readonly pending = input(false);
  readonly readOnly = input(false);
  readonly appearance = input<'card' | 'plain' | 'dialog' | 'sidebar' | 'page'>('card');
  readonly hideHeader = input(false);
  readonly submitFullWidth = input(false);
  readonly showSubmit = input(true);
  readonly fillContent = input(false);
  readonly validSubmit = output<void>();
  readonly sectionFocusRequested = output<string>();
  private readonly registry = inject(FormFieldRegistry);
  readonly fields = this.registry.fields;
  readonly checking = signal(false);
  private readonly revision = signal(0);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly locale = inject(UI_LOCALIZATION);
  private dispatching = false;
  readonly summary = computed(() => {
    this.revision();
    return this.fields().filter((field) => field.error());
  });
  readonly validationIssues = computed(() => {
    const form = this.form();
    if (typeof form === 'function') {
      if (!form().touched()) return [];
      const seen = new Set<ReadonlyFieldTree<unknown>>();
      return form()
        .errorSummary()
        .flatMap((error, index) => {
          if (seen.has(error.fieldTree)) return [];
          seen.add(error.fieldTree);
          const field = this.fields().find((field) => field.name() === error.fieldTree().name());
          return [
            {
              id: field?.id ?? `native-error-${index}`,
              label: field?.label() ?? this.title(),
              message:
                field?.error() ?? error.message ?? this.locale.translate('common.validationErrors'),
            },
          ];
        });
    }
    return this.summary().flatMap((field) => {
      const message = field.error();
      return message === null ? [] : [{ id: field.id, label: field.label(), message }];
    });
  });

  constructor() {
    effect((onCleanup) => {
      const form = this.form();
      if (typeof form === 'function') return;
      const subscription = form.events.subscribe(() => this.revision.update((value) => value + 1));
      onCleanup(() => subscription.unsubscribe());
    });
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (
      !this.showSubmit() ||
      this.pending() ||
      this.checking() ||
      this.dispatching ||
      this.readOnly()
    )
      return;
    const form = this.form();
    if (typeof form === 'function') {
      this.checking.set(true);
      try {
        const success = await submitSignalForm(form);
        if (!success && this.form() === form && !this.destroyRef.destroyed) this.revealErrors();
      } finally {
        this.checking.set(false);
      }
      return;
    }
    form.markAllAsTouched();
    this.revision.update((value) => value + 1);
    if (form.pending) {
      this.checking.set(true);
      try {
        await firstValueFrom(
          form.statusChanges.pipe(
            filter((status) => status !== 'PENDING'),
            takeUntilDestroyed(this.destroyRef),
          ),
        );
      } catch {
        return;
      } finally {
        this.checking.set(false);
      }
    }
    if (
      !this.showSubmit() ||
      this.pending() ||
      this.readOnly() ||
      this.form() !== form ||
      this.destroyRef.destroyed
    )
      return;
    if (form.invalid || form.disabled) {
      const field = this.fields().find((field) => field.error());
      if (field) this.focusField(field);
      return;
    }
    // Parent pending inputs arrive on the next render. Cover the interval before then.
    this.dispatching = true;
    afterNextRender(
      () => {
        this.dispatching = false;
      },
      { injector: this.injector },
    );
    this.validSubmit.emit();
  }

  focusError(id: string): void {
    const field = this.fields().find((field) => field.id === id);
    if (field) {
      this.focusField(field);
      return;
    }
    const form = this.form();
    if (typeof form === 'function' && id.startsWith('native-error-'))
      form().errorSummary()[Number(id.slice(13))]?.fieldTree().focusBoundControl();
  }
  /** Server field errors use the same summary and focus contract as client validation. */
  revealErrors(): void {
    const form = this.form();
    if (typeof form === 'function') form().markAsTouched();
    else form.markAllAsTouched();
    this.revision.update((value) => value + 1);
    afterNextRender(
      () => {
        if (this.destroyRef.destroyed || this.form() !== form) return;
        if (typeof form === 'function') {
          const error = form().errorSummary()[0];
          const field = error
            ? this.fields().find((candidate) => candidate.name() === error.fieldTree().name())
            : undefined;
          if (field) this.focusField(field);
          else error?.fieldTree().focusBoundControl();
        } else {
          const field = this.fields().find((field) => field.error());
          if (field) this.focusField(field);
        }
      },
      { injector: this.injector },
    );
  }

  private focusField(field: RegisteredFormField): void {
    const section = field.sectionId();
    if (!section) {
      field.focus();
      return;
    }
    this.sectionFocusRequested.emit(section);
    afterNextRender(
      () => {
        if (!this.destroyRef.destroyed) field.focus();
      },
      { injector: this.injector },
    );
  }
}

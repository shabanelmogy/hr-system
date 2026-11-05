import { afterNextRender, Component, computed, contentChildren, DestroyRef, effect, inject, Injector, input, output, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { submit as submitSignalForm, type FieldTree, type ReadonlyFieldTree } from '@angular/forms/signals';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';
import { ActionButton } from '../buttons/public-api';
import { UI_LOCALIZATION } from '../../localization/public-api';
import { FormFieldControl } from './form-field-control';
import { ValidationSummary } from './validation-summary';

@Component({
  selector: 'erp-form',
  imports: [ActionButton, ValidationSummary],
  template: `
    <form novalidate [class.plain]="appearance() !== 'card'" [class.dialog-form]="appearance()==='dialog'" [class.sidebar-form]="appearance()==='sidebar'" [attr.aria-label]="title()" [attr.aria-busy]="pending() || checking() ? 'true' : null" (submit)="submit($event)">
      @if (!hideHeader()) { <header><h2>{{ title() }}</h2><ng-content select="[formHeader]" /></header> }
      @if (validationIssues().length) {
        <erp-validation-summary [issues]="validationIssues()" (issueSelected)="focusError($event)" />
      }
      @if (feedback()) { <p [attr.role]="feedbackKind() === 'error' ? 'alert' : 'status'" class="form-feedback" [class.success]="feedbackKind() === 'success'">{{ feedback() }}</p> }
      <section class="form-content"><ng-content /></section>
      <footer>
        <div class="form-tools"><ng-content select="[formTools]" /></div>
        <ng-content select="[formActions]" />
        @if(showSubmit()){<erp-button [label]="submitLabel()" type="submit" [fullWidth]="submitFullWidth()" [disabled]="readOnly()" [busy]="pending() || checking()"><ng-content select="[formSubmitIcon]" ngProjectAs="[buttonIcon]" /></erp-button>}
      </footer>
      <ng-content select="[afterSubmit]" />
    </form>
  `,
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
  readonly appearance = input<'card' | 'plain' | 'dialog' | 'sidebar'>('card');
  readonly hideHeader = input(false);
  readonly submitFullWidth = input(false);
  readonly showSubmit = input(true);
  readonly validSubmit = output<void>();
  readonly fields = contentChildren(FormFieldControl, { descendants: true });
  readonly checking = signal(false);
  private readonly revision = signal(0);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly locale = inject(UI_LOCALIZATION);
  private dispatching = false;
  readonly summary = computed(() => { this.revision(); return this.fields().filter(field => field.error()); });
  readonly validationIssues = computed(() => {
    const form = this.form();
    if (typeof form === 'function') {
      if (!form().touched()) return [];
      const seen = new Set<ReadonlyFieldTree<unknown>>();
      return form().errorSummary().flatMap((error, index) => {
        if (seen.has(error.fieldTree)) return [];
        seen.add(error.fieldTree);
        const field = this.fields().find(field => field.name() === error.fieldTree().name());
        return [{
          id: field?.id ?? `native-error-${index}`,
          label: field?.label() ?? this.title(),
          message: field?.error() ?? error.message ?? this.locale.translate('common.validationErrors'),
        }];
      });
    }
    return this.summary().flatMap(field => {
      const message = field.error();
      return message === null ? [] : [{ id: field.id, label: field.label(), message }];
    });
  });

  constructor() {
    effect(onCleanup => {
      const form = this.form();
      if (typeof form === 'function') return;
      const subscription = form.events.subscribe(() => this.revision.update(value => value + 1));
      onCleanup(() => subscription.unsubscribe());
    });
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.showSubmit() || this.pending() || this.checking() || this.dispatching || this.readOnly()) return;
    const form = this.form();
    if (typeof form === 'function') {
      this.checking.set(true);
      try {
        const success = await submitSignalForm(form);
        if (!success && this.form() === form && !this.destroyRef.destroyed) this.revealErrors();
      } finally { this.checking.set(false); }
      return;
    }
    form.markAllAsTouched(); this.revision.update(value => value + 1);
    if (form.pending) {
      this.checking.set(true);
      try { await firstValueFrom(form.statusChanges.pipe(filter(status => status !== 'PENDING'), takeUntilDestroyed(this.destroyRef))); }
      catch { return; }
      finally { this.checking.set(false); }
    }
    if (!this.showSubmit() || this.pending() || this.readOnly() || this.form() !== form || this.destroyRef.destroyed) return;
    if (form.invalid || form.disabled) { this.fields().find(field => field.error())?.focus(); return; }
    // Parent pending inputs arrive on the next render. Cover the interval before then.
    this.dispatching = true;
    afterNextRender(() => { this.dispatching = false; }, { injector: this.injector });
    this.validSubmit.emit();
  }

  focusError(id: string): void {
    const field = this.fields().find(field => field.id === id);
    if (field) { field.focus(); return; }
    const form = this.form();
    if (typeof form === 'function' && id.startsWith('native-error-')) form().errorSummary()[Number(id.slice(13))]?.fieldTree().focusBoundControl();
  }
  /** Server field errors use the same summary and focus contract as client validation. */
  revealErrors():void{
    const form=this.form();if(typeof form==='function')form().markAsTouched();else form.markAllAsTouched();this.revision.update(value=>value+1);
    afterNextRender(()=>{
      if(this.destroyRef.destroyed||this.form()!==form)return;
      if(typeof form==='function')form().errorSummary()[0]?.fieldTree().focusBoundControl();
      else this.fields().find(field=>field.error())?.focus();
    },{injector:this.injector});
  }
}

import { booleanAttribute, ChangeDetectorRef, Component, computed, DestroyRef, DoCheck, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';
import type { Subscription } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { LocalizationRuntime, UiTextPipe } from '../../../../platform/localization/public-api';
import { clearServerFieldError, type FieldMessages } from '../form-errors';

let fieldSequence = 0;

@Component({
  selector: 'erp-text-field',
  imports: [InputText, UiTextPipe],
  template: `
    <label [for]="id" [class.floating-label]="appearance() === 'floating'" [class.visually-hidden]="labelVisibility() === 'sr-only'" [class.invalid]="!!error()">{{ label() }}@if (required()) { <span aria-hidden="true"> *</span> }</label>
    <div class="input-row" [class.invalid]="!!error()">
      <ng-content select="[fieldIcon]" />
      <input #input pInputText [id]="id" [type]="inputType()" [value]="value()"
        [attr.maxlength]="maxLength()" [placeholder]="placeholder()"
        [disabled]="disabled()" [readOnly]="readOnly()" [attr.autocomplete]="autocomplete()"
        [attr.name]="name() || id" [attr.aria-required]="required() ? 'true' : null"
        [invalid]="!!error()" [attr.aria-invalid]="error() ? 'true' : null"
        [attr.aria-describedby]="describedBy()" (input)="onInput($event)" (blur)="blur()"
        (compositionstart)="composing = true" (compositionend)="compositionEnd($event)" />
      @if (showCounter() && maxLength(); as limit) { <span class="counter" [id]="id + '-counter'">{{ value().length }}/{{ limit }}</span> }
      @if (showClear() && value() && !readOnly() && !disabled()) {
        <button type="button" class="field-action" [attr.aria-label]="'general.clear' | uiText"
          (click)="clear()"><span aria-hidden="true">×</span></button>
      }
      @if (type() === 'password' && (!revealOnlyWithValue() || value())) {
        <button type="button" class="field-action reveal" [disabled]="disabled()" [attr.aria-pressed]="revealed()"
          [attr.aria-label]="(revealed() ? 'hidePassword' : 'showPassword') | uiText"
          (click)="revealed.set(!revealed())">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>
            @if (revealed()) { <path d="m3 3 18 18"/> }
          </svg>
        </button>
      }
    </div>
    @if (help()) { <p class="help" [id]="id + '-help'">{{ help() }}</p> }
    @if (error(); as message) { <p class="error" [id]="id + '-error'">{{ message }}</p> }
  `,
  styleUrl: './text-field.scss',
  host: { '[class.floating]': "appearance() === 'floating'" },
})
export class TextField implements ControlValueAccessor, DoCheck {
  readonly labelVisibility = input<'visible'|'sr-only'>('visible');
  readonly placeholder = input('');
  readonly label = input.required<string>();
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly name = input('');
  readonly help = input('');
  readonly autocomplete = input('off');
  readonly messages = input<FieldMessages>({});
  readonly required = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly showClear = input(true, { transform: booleanAttribute });
  readonly appearance = input<'default' | 'floating'>('default');
  readonly maxLength = input<number | null>(null);
  readonly showCounter = input(false);
  readonly revealOnlyWithValue = input(false);
  readonly id = `erp-field-${++fieldSequence}`;
  readonly value = signal('');
  readonly disabled = signal(false);
  readonly revealed = signal(false);
  readonly inputType = computed(() => this.type() === 'password' && this.revealed() ? 'text' : this.type());
  private readonly revision = signal(0);
  readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly runtime = inject(LocalizationRuntime);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private observedControl: AbstractControl | null = null;
  private subscription: Subscription | undefined;
  composing = false;
  private changed: (value: string) => void = () => {};
  private touched: () => void = () => {};

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
    this.destroyRef.onDestroy(() => this.subscription?.unsubscribe());
  }

  ngDoCheck(): void {
    const control = this.ngControl?.control ?? null;
    if (control === this.observedControl) return;
    this.subscription?.unsubscribe(); this.observedControl = control;
    this.subscription = control?.events.subscribe(() => {
      this.revision.update(value => value + 1); this.cdr.markForCheck();
    });
  }

  error(): string | null {
    this.revision();
    const control = this.ngControl?.control;
    if (!control?.invalid || !control.touched) return null;
    const server: unknown = control.errors?.['server'];
    if (typeof server === 'string') return server;
    const first = Object.entries(control.errors ?? {})[0];
    if (!first) return null;
    const message = this.messages()[first[0]];
    return typeof message === 'function' ? message(first[1]) : message ?? this.runtime.translate('common.validationErrors');
  }

  describedBy(): string | null {
    return [this.help() ? this.id + '-help' : '', this.error() ? this.id + '-error' : '', this.showCounter() ? this.id + '-counter' : ''].filter(Boolean).join(' ') || null;
  }

  writeValue(value: unknown): void { this.value.set(typeof value === 'string' ? value : ''); this.revealed.set(false); }
  registerOnChange(callback: (value: string) => void): void { this.changed = callback; }
  registerOnTouched(callback: () => void): void { this.touched = callback; }
  setDisabledState(disabled: boolean): void { this.disabled.set(disabled); }
  focus(): void { this.input().nativeElement.focus(); }
  onInput(event: Event): void {
    if (!this.composing && event.target instanceof HTMLInputElement) this.accept(event.target.value);
  }
  compositionEnd(event: CompositionEvent): void { this.composing = false; this.onInput(event); }
  blur(): void { this.touched(); }
  clear(): void { this.accept(''); this.touched(); this.focus(); }

  private accept(value: string): void {
    if (this.disabled() || this.readOnly() || value === this.value()) return;
    clearServerFieldError(this.ngControl?.control ?? null);
    this.value.set(value); this.changed(value);
  }
}

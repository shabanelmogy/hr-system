import { booleanAttribute, Component, computed, ElementRef, input, output, viewChild } from '@angular/core';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import type { ButtonSeverity } from 'primeng/types/button';

@Component({
  selector: 'erp-button',
  imports: [ButtonDirective, ButtonLabel],
  template: `
    <button #control pButton [type]="type()" [severity]="severity()"
      [variant]="primeVariant()"
      [raised]="variant() === 'contained'"
      [disabled]="disabled() || busy()" [attr.aria-busy]="busy() ? 'true' : null"
      [attr.aria-pressed]="pressed()"
      [attr.aria-expanded]="expanded()" [attr.aria-controls]="controls()" [attr.aria-haspopup]="hasPopup()"
      [class.erp-action-fluid]="fullWidth()" [class.quiet]="appearance() === 'quiet'" [class.icon-only]="appearance() === 'icon'"
      [attr.aria-label]="appearance() === 'icon' ? label() : null" (click)="activate($event)">
      @if (busy()) { <span class="erp-action-spinner" aria-hidden="true"></span> }
      <ng-content select="[buttonIcon]" />
      <span pButtonLabel>{{ label() }}@if (description()) { <span class="erp-action-description">{{ description() }}</span> }</span>
    </button>
  `,
  host: { '[class.erp-action-host-fluid]': 'fullWidth()' },
  styleUrl: './action-button.scss',
})
export class ActionButton {
  readonly label = input.required<string>();
  readonly description = input('');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly severity = input<ButtonSeverity>('primary');
  readonly variant = input<'contained' | 'outlined' | 'text'>('contained');
  readonly primeVariant = computed(() => {
    const variant = this.variant();
    return variant === 'contained' ? undefined : variant;
  });
  readonly busy = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly pressed = input<boolean | null>(null);
  readonly expanded = input<boolean | null>(null);
  readonly controls = input<string | null>(null);
  readonly hasPopup = input<'dialog' | 'menu' | null>(null);
  readonly appearance = input<'default' | 'quiet' | 'icon'>('default');
  readonly activated = output<MouseEvent>();
  private readonly control = viewChild.required<ElementRef<HTMLButtonElement>>('control');

  focus(): void { this.control().nativeElement.focus(); }

  activate(event: MouseEvent): void {
    if (this.disabled() || this.busy()) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    this.activated.emit(event);
  }
}

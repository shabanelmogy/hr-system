import {
  booleanAttribute,
  Component,
  computed,
  type ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import type { ButtonSeverity } from 'primeng/types/button';

@Component({
  selector: 'erp-button',
  imports: [ButtonDirective, ButtonLabel],
  templateUrl: './action-button.html',
  host: { '[class.erp-action-host-fluid]': 'fullWidth()' },
  styleUrl: './action-button.scss',
})
export class ActionButton {
  readonly label = input.required<string>();
  readonly accessibleLabel = input<string | null>(null);
  readonly description = input('');
  /** Keep an icon-only, labelled action in narrow layouts. Supply buttonIcon content. */
  readonly compactOnSmallScreens = input(false, { transform: booleanAttribute });
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
  readonly appearance = input<'default' | 'quiet' | 'icon' | 'toggle'>('default');
  readonly activated = output<MouseEvent>();
  private readonly control = viewChild.required<ElementRef<HTMLButtonElement>>('control');

  focus(): void {
    this.control().nativeElement.focus();
  }

  activate(event: MouseEvent): void {
    if (this.disabled() || this.busy()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.activated.emit(event);
  }
}

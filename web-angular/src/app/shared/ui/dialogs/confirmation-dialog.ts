import { Component, input, output, viewChild } from '@angular/core';
import type { ButtonSeverity } from 'primeng/types/button';
import { ActionButton } from '../buttons/public-api';
import { DialogPanel } from './dialog-panel';

@Component({
  selector: 'erp-confirmation-dialog', imports: [DialogPanel, ActionButton],
  template: `
    <erp-dialog-panel [open]="open()" [title]="title()" [description]="description()"
      [closeLabel]="cancelLabel()" [pending]="pending()" [manualInitialFocus]="true"
      (closeRequested)="cancel()" (shown)="focusSafeAction()">
      <ng-content />
      <erp-button #safeAction dialogActions [label]="cancelLabel()" variant="text" [disabled]="pending()" (activated)="cancel()" />
      <erp-button dialogActions [label]="confirmLabel()" [severity]="severity()" [busy]="pending()" (activated)="confirm()" />
    </erp-dialog-panel>
  `,
})
export class ConfirmationDialog {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly description = input('');
  readonly cancelLabel = input.required<string>();
  readonly confirmLabel = input.required<string>();
  readonly severity = input<ButtonSeverity>('warn');
  readonly pending = input(false);
  readonly cancelled = output<void>();
  readonly confirmed = output<void>();
  private readonly safeAction = viewChild.required<ActionButton>('safeAction');
  focusSafeAction(): void { if (this.open() && !this.pending()) this.safeAction().focus(); }
  cancel(): void { if (this.open() && !this.pending()) this.cancelled.emit(); }
  confirm(): void { if (this.open() && !this.pending()) this.confirmed.emit(); }
}

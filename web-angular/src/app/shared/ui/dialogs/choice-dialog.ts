import { Component, effect, input, output, signal } from '@angular/core';
import { DialogPanel } from './dialog-panel';
import { ActionButton } from '../buttons/public-api';
import { AppIcon, type AppIconName } from '../icons/app-icon';

@Component({ selector: 'erp-choice-dialog', imports: [DialogPanel, ActionButton, AppIcon], template: `
  <erp-dialog-panel [open]="open()" [title]="title()" [description]="description()" [icon]="icon()"
    [pending]="pending()" [closeLabel]="closeLabel()" (closeRequested)="cancel()">
    <div class="choices">@for (option of options(); track option.value) {
      <erp-button [label]="option.label" [description]="option.description ?? ''" appearance="quiet" severity="secondary" [pressed]="selected() === option.value"
        [disabled]="pending()" fullWidth (activated)="select(option.value)">
        @if (icon(); as name) { <span buttonIcon class="option-icon"><erp-icon [name]="name" /></span> }
      </erp-button>
    }</div>
    <erp-button dialogActions [label]="cancelLabel()" variant="text" [disabled]="pending()" (activated)="cancel()" />
    <erp-button dialogActions [label]="continueLabel()" [disabled]="!selected()" [busy]="pending()" (activated)="choose()" />
  </erp-dialog-panel>`, styles: `
    .choices{display:grid;gap:0.25rem}.choices erp-button{--action-min-height:64px;--action-radius:8px;--action-quiet-background:transparent;--action-padding-x:16px}
    .option-icon{flex:0 0 40px;width:40px;height:40px;display:grid;place-items:center;background:var(--accent);color:var(--primary);border-radius:8px;margin-inline-end:8px}
  ` })
export class ChoiceDialog {
  readonly open = input(false); readonly identity = input(''); readonly title = input.required<string>();
  readonly description = input(''); readonly options = input<readonly { value: string; label: string; description?: string }[]>([]);
  readonly icon = input<AppIconName | null>(null);
  readonly cancelLabel = input.required<string>(); readonly continueLabel = input.required<string>(); readonly pending = input(false);
  readonly closeLabel = input.required<string>();
  readonly cancelled = output<void>(); readonly chosen = output<string>(); readonly selected = signal('');
  constructor() { effect(() => { this.identity(); this.selected.set(''); }); }
  cancel(): void { if (this.open() && !this.pending()) this.cancelled.emit(); }
  select(value: string): void { if (this.open() && !this.pending() && this.options().some(option => option.value === value)) this.selected.set(value); }
  choose(): void { if (this.open() && !this.pending() && this.selected() && this.options().some(option => option.value === this.selected())) this.chosen.emit(this.selected()); }
}

import { Component, effect, input, output, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ActionButton } from '../buttons/public-api';
import { AppIcon, type AppIconName } from '../icons/app-icon';

@Component({ selector: 'erp-choice-dialog', imports: [Dialog, ActionButton, AppIcon], template: `
  <p-dialog [visible]="open()" (visibleChange)="!$event && !pending() && cancelled.emit()" [header]="title()"
    [modal]="true" [closable]="!pending()" [closeOnEscape]="!pending()" [draggable]="false" [resizable]="false"
    appendTo="body" [closeAriaLabel]="closeLabel()" [style]="{width:'37.5rem', maxWidth:'calc(100vw - 2rem)'}">
    <ng-template #header let-titleId="ariaLabelledBy"><div class="choice-heading">
      @if (icon(); as name) { <span class="heading-icon"><erp-icon [name]="name" /></span> }
      <div><h2 [id]="titleId">{{ title() }}</h2><p>{{ description() }}</p></div>
    </div></ng-template>
    <div class="choices">@for (option of options(); track option.value) {
      <erp-button [label]="option.label" [description]="option.description ?? ''" appearance="quiet" severity="secondary" [pressed]="selected() === option.value"
        [disabled]="pending()" fullWidth (activated)="selected.set(option.value)">
        @if (icon(); as name) { <span buttonIcon class="option-icon"><erp-icon [name]="name" /></span> }
      </erp-button>
    }</div>
    <ng-template #footer>
      <erp-button [label]="cancelLabel()" variant="text" [disabled]="pending()" (activated)="cancelled.emit()" />
      <erp-button [label]="continueLabel()" [disabled]="!selected()" [busy]="pending()" (activated)="selected() && chosen.emit(selected())" />
    </ng-template>
  </p-dialog>`, styles: `
    .choices{display:grid;gap:0.25rem}.choices erp-button{--action-min-height:64px;--action-radius:8px;--action-quiet-background:transparent;--action-padding-x:16px}
    .choice-heading{display:flex;align-items:center;gap:12px;min-width:0}h2{font-size:20px;line-height:1.6;margin:0;font-weight:600}
    p{color:var(--muted-foreground);margin:0;font-size:14px;line-height:1.43}.heading-icon,.option-icon{flex:0 0 40px;width:40px;height:40px;display:grid;place-items:center}
    .heading-icon{background:var(--primary);color:var(--primary-foreground);border-radius:50%}.option-icon{background:var(--accent);color:var(--primary);border-radius:8px;margin-inline-end:8px}
  ` })
export class ChoiceDialog {
  readonly open = input(false); readonly identity = input(''); readonly title = input.required<string>();
  readonly description = input(''); readonly options = input<readonly { value: string; label: string; description?: string }[]>([]);
  readonly icon = input<AppIconName | null>(null);
  readonly cancelLabel = input.required<string>(); readonly continueLabel = input.required<string>(); readonly pending = input(false);
  readonly closeLabel = input.required<string>();
  readonly cancelled = output<void>(); readonly chosen = output<string>(); readonly selected = signal('');
  constructor() { effect(() => { this.identity(); this.selected.set(''); }); }
}

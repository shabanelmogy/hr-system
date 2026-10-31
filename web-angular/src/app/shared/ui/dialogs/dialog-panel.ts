import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, output, untracked } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { AppIcon, type AppIconName } from '../icons/app-icon';

/** The shared modal frame. Callers own consent, content and actions. */
@Component({
  selector: 'erp-dialog-panel',
  imports: [Dialog, AppIcon],
  template: `
    <p-dialog [visible]="open()" (visibleChange)="!$event && requestClose()" [header]="title()"
      [modal]="true" [closable]="!pending()" [closeOnEscape]="!pending()" [dismissableMask]="false"
      [draggable]="false" [resizable]="false" [blockScroll]="true" [focusTrap]="true"
      appendTo="body" [closeAriaLabel]="closeLabel()" [focusOnShow]="!manualInitialFocus()"
      (onShow)="shown.emit()" (onHide)="restoreFocus()"
      [style]="{width:'37.5rem', maxWidth:'calc(100vw - 2rem)', maxHeight:'calc(100dvh - 2rem)'}">
      <ng-template #header let-titleId="ariaLabelledBy"><div class="dialog-heading">
        @if (icon(); as name) { <span class="heading-icon" [class.danger]="tone()==='danger'"><erp-icon [name]="name" /></span> }
        <div class="heading-copy"><h2 [id]="titleId">{{ title() }}</h2>
          @if (description()) { <p>{{ description() }}</p> }
        </div>
      </div></ng-template>
      <div class="dialog-body" [attr.aria-busy]="pending() ? 'true' : null"><ng-content /></div>
      @if(showFooter()){<ng-template #footer><div class="dialog-actions"><ng-content select="[dialogActions]" /></div></ng-template>}
    </p-dialog>
  `,
  styles: `
    .dialog-heading{display:flex;align-items:center;gap:12px;min-width:0}
    .heading-copy{min-width:0;overflow-wrap:anywhere}
    h2{font-size:20px;line-height:1.6;margin:0;font-weight:600}
    p{color:var(--muted-foreground);margin:0;font-size:14px;line-height:1.43}
    .heading-icon{flex:0 0 40px;width:40px;height:40px;display:grid;place-items:center;background:var(--primary);color:var(--primary-foreground);border-radius:50%}
    .heading-icon.danger{background:var(--destructive);color:var(--destructive-foreground)}
    .dialog-body{min-width:0;overflow-wrap:anywhere}
    .dialog-actions{display:flex;justify-content:flex-end;align-items:center;flex-wrap:wrap;gap:8px;min-width:0;width:100%}
  `,
})
export class DialogPanel {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly description = input('');
  readonly closeLabel = input.required<string>();
  readonly icon = input<AppIconName | null>(null);
  readonly tone=input<'primary'|'danger'>('primary');
  readonly pending = input(false);
  readonly manualInitialFocus = input(false);
  readonly showFooter = input(true);
  readonly closeRequested = output<void>();
  readonly shown = output<void>();
  private readonly document = inject(DOCUMENT);
  private returnTarget: HTMLElement | null = null;
  constructor() {
    effect(() => {
      const open = this.open();
      untracked(() => {
        if (open) this.returnTarget = this.document.activeElement instanceof HTMLElement ? this.document.activeElement : null;
      });
    });
    inject(DestroyRef).onDestroy(() => this.restoreFocus());
  }
  requestClose(): void { if (this.open() && !this.pending()) this.closeRequested.emit(); }
  restoreFocus(): void {
    const target = this.returnTarget;
    this.returnTarget = null;
    queueMicrotask(() => {
      if (!target?.isConnected || target.matches(':disabled, [inert], [aria-disabled="true"]')) return;
      // A closing animation can finish after the user has already focused search
      // or a refreshed collection row. Preserve that deliberate outside focus.
      const active = this.document.activeElement;
      if (active instanceof HTMLElement && active !== this.document.body && active.isConnected && !active.closest('[role="dialog"]')) return;
      const dialogs = Array.from(this.document.querySelectorAll<HTMLElement>('[role="dialog"]'))
        .filter(dialog => dialog.getClientRects().length > 0)
        .sort((a, b) => Number(getComputedStyle(a).zIndex) - Number(getComputedStyle(b).zIndex));
      const top = dialogs.at(-1);
      if (!top || top.contains(target)) target.focus();
    });
  }
}

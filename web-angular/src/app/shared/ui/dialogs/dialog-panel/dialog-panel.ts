import { DOCUMENT } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';

/** The shared modal frame. Callers own consent, content and actions. */
@Component({
  selector: 'erp-dialog-panel',
  imports: [Dialog, AppIcon],
  templateUrl: './dialog-panel.html',
  styleUrl: './dialog-panel.scss',
})
export class DialogPanel {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly description = input('');
  readonly closeLabel = input.required<string>();
  readonly icon = input<AppIconName | null>(null);
  readonly tone = input<'primary' | 'danger'>('primary');
  readonly pending = input(false);
  readonly manualInitialFocus = input(false);
  readonly showFooter = input(true);
  readonly size = input<'default' | 'wide'>('default');
  readonly panelWidth = computed(() => (this.size() === 'wide' ? '76rem' : '37.5rem'));
  readonly closeRequested = output<void>();
  readonly shown = output<void>();
  private readonly document = inject(DOCUMENT);
  private returnTarget: HTMLElement | null = null;
  constructor() {
    effect(() => {
      const open = this.open();
      untracked(() => {
        if (open)
          this.returnTarget =
            this.document.activeElement instanceof HTMLElement ? this.document.activeElement : null;
      });
    });
    inject(DestroyRef).onDestroy(() => this.restoreFocus());
  }
  requestClose(): void {
    if (this.open() && !this.pending()) this.closeRequested.emit();
  }
  restoreFocus(): void {
    const target = this.returnTarget;
    this.returnTarget = null;
    queueMicrotask(() => {
      if (!target?.isConnected || target.matches(':disabled, [inert], [aria-disabled="true"]'))
        return;
      // A closing animation can finish after the user has already focused search
      // or a refreshed collection row. Preserve that deliberate outside focus.
      const active = this.document.activeElement;
      if (
        active instanceof HTMLElement &&
        active !== this.document.body &&
        active.isConnected &&
        !active.closest('[role="dialog"]')
      )
        return;
      const dialogs = Array.from(this.document.querySelectorAll<HTMLElement>('[role="dialog"]'))
        .filter((dialog) => dialog.getClientRects().length > 0)
        .sort((a, b) => Number(getComputedStyle(a).zIndex) - Number(getComputedStyle(b).zIndex));
      const top = dialogs.at(-1);
      if (!top || top.contains(target)) target.focus();
    });
  }
}

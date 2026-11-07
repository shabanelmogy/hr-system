import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { UiTextPipe } from '../../../localization/public-api';
import { ActionButton } from '../action-button/action-button';
import { AppIcon } from '../../icons/app-icon/app-icon';

@Component({
  imports: [ActionButton, AppIcon, UiTextPipe],
  selector: 'erp-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './copy-button.scss',
  templateUrl: './copy-button.html',
  host: { '[class.icon-only]': 'iconOnly()' },
})
export class CopyButton {
  readonly content = input.required<() => string | null>();
  readonly label = input.required<string>();
  readonly iconOnly = input(false, { transform: booleanAttribute });
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroy = inject(DestroyRef);
  readonly pending = signal(false);
  private readonly outcome = signal<{ readonly text: string; readonly key: string } | null>(null);
  readonly feedback = computed(() => {
    const outcome = this.outcome();
    return outcome && this.current(outcome.text) ? outcome.key : '';
  });
  async copy(): Promise<void> {
    if (this.pending()) return;
    const text = this.content()();
    if (text === null) return;
    this.outcome.set(null);
    this.pending.set(true);
    try {
      const clipboard = this.browser ? this.document.defaultView?.navigator.clipboard : undefined;
      if (!clipboard) throw Error('Clipboard is unavailable');
      await clipboard.writeText(text);
      if (this.current(text)) this.outcome.set({ text, key: 'common.copied' });
    } catch {
      if (this.current(text)) this.outcome.set({ text, key: 'errorDialog.copyFailed' });
    } finally {
      if (!this.destroy.destroyed) this.pending.set(false);
    }
  }
  private current(text: string): boolean {
    return !this.destroy.destroyed && this.content()() === text;
  }
}

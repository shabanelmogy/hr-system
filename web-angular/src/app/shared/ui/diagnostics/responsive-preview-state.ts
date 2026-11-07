import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable, isDevMode, signal } from '@angular/core';
import { UnsavedChanges } from '../../data/navigation.public-api';
import { viewportPreset, type ViewportPreset } from './responsive-preview-presets';

/** Development-only, same-origin iframe. Messages carry allowlisted preset IDs, never URLs or credentials. */
@Injectable({ providedIn: 'root' })
export class ResponsivePreviewState {
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly drafts = inject(UnsavedChanges);
  readonly enabled = isDevMode();
  readonly active = signal<ViewportPreset | null>(null);
  readonly target = signal<string | null>(null);
  readonly closing = signal(false);
  private frame: Window | null = null;
  private ready = false;
  readonly embedded =
    this.enabled && this.view?.name === 'erp-responsive-preview' && this.view.parent !== this.view;
  private readonly initialPreset =
    this.enabled && this.view
      ? viewportPreset(new URL(this.view.location.href).searchParams.get('erp-responsive-host'))
      : undefined;
  readonly standalone = !this.embedded && this.initialPreset !== undefined;

  constructor() {
    if (!this.enabled || !this.view) return;
    if (this.standalone && this.initialPreset) {
      const target = new URL(this.view.location.href);
      target.searchParams.delete('erp-responsive-host');
      target.searchParams.set('erp-viewport-preview', '1');
      this.target.set(target.href);
      this.active.set(this.initialPreset);
    }
    const listener = (event: MessageEvent<unknown>) => {
      void this.receive(event);
    };
    this.view.addEventListener('message', listener);
    inject(DestroyRef).onDestroy(() => this.view?.removeEventListener('message', listener));
  }

  select(id: string): void {
    if (!this.enabled || !this.view) return;
    if (id === 'current') {
      if (this.embedded) this.post(this.view.parent, { type: 'erp.viewport.exit' });
      else this.requestClose();
      return;
    }
    const preset = viewportPreset(id);
    if (!preset) return;
    if (this.embedded) {
      this.post(this.view.parent, { type: 'erp.viewport.resize', id: preset.id });
      return;
    }
    if (!this.standalone) {
      const target = new URL(this.view.location.href);
      target.searchParams.delete('erp-viewport-preview');
      target.searchParams.set('erp-responsive-host', preset.id);
      this.view.open(target.href, '_blank', 'noopener,noreferrer');
      return;
    }
    this.active.set(preset);
  }

  attach(frame: HTMLIFrameElement): void {
    this.frame = frame.contentWindow;
    this.ready = false;
    this.post(this.frame, { type: 'erp.viewport.ping' });
  }

  requestClose(): void {
    if (!this.enabled || !this.active() || this.closing()) return;
    if (!this.ready) {
      this.close();
      return;
    }
    this.closing.set(true);
    this.post(this.frame, { type: 'erp.viewport.close-request' });
  }

  private async receive(event: MessageEvent<unknown>): Promise<void> {
    if (
      !this.view ||
      event.origin !== this.view.location.origin ||
      !event.data ||
      typeof event.data !== 'object' ||
      !('type' in event.data)
    )
      return;
    const type = event.data.type;
    if (this.embedded) {
      if (event.source !== this.view.parent) return;
      if (type === 'erp.viewport.ping') this.post(this.view.parent, { type: 'erp.viewport.ready' });
      if (type === 'erp.viewport.close-request') {
        const stamp = this.drafts.stamp();
        const accepted = await this.drafts.request('responsive-preview:close');
        this.post(this.view.parent, {
          type: 'erp.viewport.close-result',
          accepted: accepted && this.drafts.matches(stamp),
        });
      }
      return;
    }
    if (!this.active() || event.source !== this.frame) return;
    if (type === 'erp.viewport.ready') this.ready = true;
    if (type === 'erp.viewport.resize' && 'id' in event.data) {
      const preset = viewportPreset(event.data.id);
      if (preset) this.active.set(preset);
    }
    if (type === 'erp.viewport.exit') this.requestClose();
    if (type === 'erp.viewport.close-result' && this.closing() && 'accepted' in event.data) {
      if (event.data.accepted === true) this.close();
      else this.closing.set(false);
    }
  }

  private post(target: Window | null, message: object): void {
    if (this.view) target?.postMessage(message, this.view.location.origin);
  }
  private close(): void {
    if (this.standalone) {
      this.closing.set(false);
      this.view?.close();
      return;
    }
    this.active.set(null);
    this.target.set(null);
    this.frame = null;
    this.ready = false;
    this.closing.set(false);
  }
}

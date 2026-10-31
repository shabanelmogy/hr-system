import { DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';

export interface DraftState {
  readonly identity: string;
  readonly revision: number;
  readonly active: boolean;
  readonly unsaved: boolean;
  readonly pending: boolean;
}
export interface DraftOwner { read(): DraftState; invalidate(): void; }
export interface TransitionConsent { readonly token: number; readonly key: string; readonly stamp: string; }

/** Live, domain-neutral editor registration. Consent never resets a draft. */
@Injectable({ providedIn: 'root' })
export class UnsavedChanges {
  private readonly owners = signal<ReadonlyMap<symbol, { serial: number; owner: DraftOwner }>>(new Map());
  private serial = 0;
  private token = 0;
  private waiting: { consent: TransitionConsent; promise: Promise<boolean>; resolve(value: boolean): void } | null = null;
  private readonly currentPrompt = signal<TransitionConsent | null>(null);
  readonly prompt = this.currentPrompt.asReadonly();
  private states() { return [...this.owners().values()].map(({ serial, owner }) => {
    try {
      const state = owner.read();
      return { serial, ...state, pending: state.pending || !state.identity.trim() || !Number.isSafeInteger(state.revision) };
    } catch { return { serial, identity: 'unavailable', revision: 0, active: true, unsaved: true, pending: true }; }
  }).filter(state => state.active); }
  readonly busy = () => this.states().some(state => state.pending);
  readonly dirty = () => this.states().some(state => state.unsaved);
  readonly stamp = () => JSON.stringify(this.states());
  constructor() {
    effect(() => { const stamp = this.stamp(); untracked(() => { if (this.waiting && this.waiting.consent.stamp !== stamp) this.cancel(); }); });
    inject(DestroyRef).onDestroy(() => this.cancel());
  }
  register(owner: DraftOwner): () => void {
    const id = Symbol('draft');
    this.owners.update(owners => new Map(owners).set(id, { serial: ++this.serial, owner }));
    return () => { if (this.owners().has(id)) this.owners.update(owners => { const next = new Map(owners); next.delete(id); return next; }); };
  }
  requiresDecision(): boolean { return this.busy() || this.dirty(); }
  matches(stamp: string): boolean { return this.stamp() === stamp && !this.busy(); }
  request(key: string): boolean | Promise<boolean> {
    if (this.waiting && this.waiting.consent.stamp !== this.stamp()) this.cancel();
    if (this.waiting) return this.waiting.consent.key === key ? this.waiting.promise : false;
    if (this.busy()) return false;
    if (!this.dirty()) return true;
    const consent: TransitionConsent = { key, stamp: this.stamp(), token: ++this.token };
    let resolve!: (value: boolean) => void;
    const promise = new Promise<boolean>(done => { resolve = done; });
    this.waiting = { consent, promise, resolve }; this.currentPrompt.set(consent);
    return promise;
  }
  answer(consent: TransitionConsent, accepted: boolean): void {
    if (this.waiting?.consent !== consent) return;
    this.settle(accepted && this.matches(consent.stamp));
  }
  cancelNavigation(): void { if (this.waiting?.consent.key.startsWith('navigation:')) this.cancel(); }
  cancel(): void { this.settle(false); }
  private settle(accepted: boolean): void {
    const waiting = this.waiting; this.waiting = null; this.currentPrompt.set(null); waiting?.resolve(accepted);
  }
  /** Trusted authority changed. Owners quarantine old drafts; no save/replay. */
  invalidate(): void {
    this.cancel(); const owners = [...this.owners().values()]; this.owners.set(new Map());
    for (const { owner } of owners) { try { owner.invalidate(); } catch { /* One departed owner cannot retain another owner's authority. */ } }
  }
}

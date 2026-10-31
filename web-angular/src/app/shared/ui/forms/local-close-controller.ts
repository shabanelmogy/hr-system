export interface CloseSnapshot {
  readonly identity: string;
  readonly revision: number;
  readonly active: boolean;
  readonly unsaved: boolean;
  readonly pending: boolean;
}
export interface CloseConsent { readonly identity: string; readonly revision: number; readonly token: number; }

/** One editor lifetime. No draft mutation, save, navigation or entity knowledge. */
export class LocalCloseController {
  private previous: CloseSnapshot | null = null;
  private prompt: CloseConsent | null = null;
  private closed = false;
  private destroyed = false;
  private nextToken = 0;
  synchronize(current: CloseSnapshot): CloseConsent | null {
    const previous = this.previous;
    if (!previous || previous.identity !== current.identity || previous.revision !== current.revision || !current.active) this.closed = false;
    if (this.destroyed || !current.active || current.pending || !current.unsaved
      || this.prompt?.identity !== current.identity || this.prompt?.revision !== current.revision) this.prompt = null;
    this.previous = { ...current };
    return this.prompt;
  }
  request(current: CloseSnapshot): boolean {
    this.synchronize(current);
    if (this.destroyed || this.closed || !current.active || current.pending || !current.identity.trim() || !Number.isSafeInteger(current.revision)) return false;
    if (!current.unsaved) { this.closed = true; return true; }
    this.prompt ??= { identity: current.identity, revision: current.revision, token: ++this.nextToken };
    return false;
  }
  consent(): CloseConsent | null { return this.prompt; }
  keep(consent: CloseConsent): void { if (this.prompt === consent) this.prompt = null; }
  confirm(current: CloseSnapshot, consent: CloseConsent): boolean {
    this.synchronize(current);
    if (this.destroyed || this.closed || this.prompt !== consent || !current.active || current.pending || !current.unsaved) return false;
    this.prompt = null;
    this.closed = true;
    return true;
  }
  destroy(): void { this.destroyed = true; this.prompt = null; }
}

import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, Subject, takeUntil, tap, timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../config/api-origin';
import { uiCatalogVersion } from './catalog.generated';
import { LocalizationRuntime } from './localization-runtime';
import type { LocalizationIdentity, LocalizationTarget, TextReset, TextWrite, UiLanguage } from './localization.types';

@Injectable({ providedIn: 'root' })
export class LocalizationService {
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(LocalizationRuntime);
  private readonly origin = inject(ERP_API_ORIGIN);
  private readonly document = inject(DOCUMENT);
  private readonly stop = new Subject<void>();
  private identity: LocalizationIdentity | null = null;
  private timer: ReturnType<typeof setInterval> | undefined;
  private refreshSequence = 0;
  private readonly failed = signal(false);
  readonly runtimeUnavailable = this.failed.asReadonly();

  constructor() {
    const parsed = new URL(this.origin);
    if (parsed.protocol !== 'https:' || parsed.origin !== this.origin) throw new Error('ERP_API_ORIGIN must be an exact HTTPS origin.');
    const onReconnect = () => { void this.refresh(); };
    this.document.defaultView?.addEventListener('online', onReconnect);
    inject(DestroyRef).onDestroy(() => {
      this.stop.next(); this.stop.complete(); clearInterval(this.timer);
      this.document.defaultView?.removeEventListener('online', onReconnect);
    });
  }

  /** Auth/context owner calls this before exposing a new identity or company. */
  connect(identity: LocalizationIdentity | null): Promise<boolean> {
    this.stop.next(); clearInterval(this.timer); this.failed.set(false);
    this.identity = identity ? structuredClone(identity) : null;
    this.runtime.transition(identity);
    if (!identity) return Promise.resolve(true);
    this.timer = setInterval(() => { void this.refresh(); }, 60_000);
    return this.refresh();
  }

  async refresh(): Promise<boolean> {
    if (!this.identity) return true;
    const generation = this.runtime.currentGeneration();
    const requestSequence = ++this.refreshSequence;
    const target = this.identity.roles.includes('super_admin') ? 'system' : 'company';
    try {
      const value = await firstValueFrom(this.http.get<unknown>(this.endpoint(target) + '/runtime', {
        withCredentials: true, params: { client: 'web', catalogVersion: uiCatalogVersion },
      }).pipe(timeout(10_000), takeUntil(this.stop)));
      if (requestSequence !== this.refreshSequence || generation !== this.runtime.currentGeneration()) return false;
      const applied = target === 'system' ? this.runtime.applySystem(value, generation) : this.runtime.applyCompany(value, generation);
      if (generation === this.runtime.currentGeneration()) {
        this.failed.set(!applied);
        if (!applied) this.runtime.clearOverrides(generation);
      }
      return applied;
    } catch {
      if (generation === this.runtime.currentGeneration() && requestSequence === this.refreshSequence) { this.failed.set(true); this.runtime.clearOverrides(generation); }
      return false;
    }
  }

  setText(target: LocalizationTarget, request: TextWrite, csrfToken: string) {
    return this.http.put<void>(this.endpoint(target) + '/text', request, this.writeOptions(csrfToken))
      .pipe(tap(() => { void this.refresh(); }));
  }

  resetText(target: LocalizationTarget, request: TextReset, csrfToken: string) {
    return this.http.post<void>(this.endpoint(target) + '/reset', request, this.writeOptions(csrfToken))
      .pipe(tap(() => { void this.refresh(); }));
  }

  setCompanyDefault(request: { language: UiLanguage; expectedRevision: number }, csrfToken: string) {
    return this.http.put<void>(this.endpoint('company') + '/default', request, this.writeOptions(csrfToken))
      .pipe(tap(() => { void this.refresh(); }));
  }

  private endpoint(target: LocalizationTarget): string {
    return `${this.origin}/api/v1/${target === 'system' ? 'system-ui-localizations' : 'company-localizations'}`;
  }

  private writeOptions(csrfToken: string) {
    if (!csrfToken.trim()) throw new Error('A current in-memory CSRF request token is required.');
    return { withCredentials: true, headers: new HttpHeaders({ 'X-ERP-XSRF': csrfToken }) };
  }
}

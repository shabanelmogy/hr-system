import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { z } from 'zod';
import type { HttpRequest } from '@microsoft/signalr';
import { ERP_API_ORIGIN } from '../../config/api-origin';
import { AuthSession, BrowserAuthService } from '../auth/session.public-api';

const changeSchema = z
  .object({
    eventId: z.string().regex(/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i),
    occurredAtUtc: z.iso.datetime({ offset: true }),
    resource: z
      .string()
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    action: z.string().trim().min(1).max(100),
    entityId: z.string().max(200).nullable(),
  })
  .strict();
export type EntityChange = z.infer<typeof changeSchema>;
export type RealtimeEvent =
  | {
      readonly kind: 'status';
      readonly status: 'connecting' | 'connected' | 'disconnected' | 'denied';
    }
  | { readonly kind: 'reconcile' }
  | { readonly kind: 'change'; readonly change: EntityChange };

/** A port keeps lazy vendor loading and connection lifetime independently testable. */
export interface RealtimeConnection {
  start(): Promise<void>;
  stop(): Promise<void>;
  on(method: string, handler: (payload: unknown) => void): void;
  onclose(handler: () => void): void;
}
export type RealtimeConnector = (
  origin: string,
  token: () => Promise<string>,
  denied: (status: number) => void,
) => Promise<RealtimeConnection>;
export const REALTIME_CONNECTOR = new InjectionToken<RealtimeConnector>('ERP realtime connector', {
  providedIn: 'root',
  factory: () => async (origin, accessTokenFactory, denied) => {
    const signalr = await import('@microsoft/signalr');
    // Observe typed HTTP denial before SignalR wraps negotiation/transport errors.
    const httpClient = new (class extends signalr.DefaultHttpClient {
      override async send(request: HttpRequest) {
        try {
          return await super.send(request);
        } catch (error) {
          const status = statusOf(error);
          if (status === 401 || status === 403) denied(status);
          throw error;
        }
      }
    })({ log() {} });
    return new signalr.HubConnectionBuilder()
      .withUrl(origin + '/hubs/company', { accessTokenFactory, httpClient, withCredentials: true })
      .configureLogging(signalr.LogLevel.None)
      .build();
  },
});

function statusOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  if ('status' in error && typeof error.status === 'number') return error.status;
  if ('statusCode' in error && typeof error.statusCode === 'number') return error.statusCode;
  return undefined;
}

/** Each subscription owns one connection. Owners unsubscribe at their actor/page
 * boundary and supply a synchronous immutable-identity check for late work. */
@Injectable({ providedIn: 'root' })
export class RealtimeEvents {
  private readonly connector = inject(REALTIME_CONNECTOR);
  private readonly transport = inject(BrowserAuthService);
  private readonly auth = inject(AuthSession);
  private readonly origin = inject(ERP_API_ORIGIN);

  watch(isCurrent: () => boolean): Observable<RealtimeEvent> {
    return new Observable((observer) => {
      let disposed = false,
        starting = false,
        failures = 0;
      let connection: RealtimeConnection | undefined;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let expiryTimer: ReturnType<typeof setTimeout> | undefined;
      const seen = new Set<string>();
      const current = () => !disposed && !observer.closed && isCurrent();
      const stop = () => {
        if (connection) void connection.stop().catch(() => undefined);
      };
      const clearExpiryTimer = () => {
        if (expiryTimer !== undefined) clearTimeout(expiryTimer);
        expiryTimer = undefined;
      };
      const scheduleTokenRenewal = (value: string) => {
        clearExpiryTimer();
        const expiresAt = tokenExpiry(value);
        if (expiresAt === undefined) return;
        const delay = Math.max(0, expiresAt - Date.now() - 10_000);
        expiryTimer = setTimeout(() => {
          expiryTimer = undefined;
          if (!current() || !connection) return;
          const stale = connection;
          connection = undefined;
          void stale.stop().catch(() => undefined);
          retry();
        }, delay);
      };
      const terminate = (reauthenticate: boolean) => {
        if (!current()) return;
        observer.next({ kind: 'status', status: 'denied' });
        disposed = true;
        if (timer !== undefined) clearTimeout(timer);
        stop();
        clearExpiryTimer();
        observer.complete();
        if (reauthenticate) void this.auth.synchronizeContext().catch(() => undefined);
      };
      const retry = () => {
        if (!current() || timer !== undefined) return;
        observer.next({ kind: 'status', status: 'disconnected' });
        const delay = Math.min(30_000, 1_000 * 2 ** Math.min(failures++, 5));
        timer = setTimeout(() => {
          timer = undefined;
          void start();
        }, delay);
      };
      const token = async () => {
        if (!current()) throw new Error('Realtime lease ended');
        try {
          const value = await this.transport.realtimeToken();
          if (!current()) throw new Error('Realtime lease ended');
          scheduleTokenRenewal(value);
          return value;
        } catch (error) {
          const status = statusOf(error);
          if (status === 401 || status === 403) terminate(status === 401);
          throw error;
        }
      };
      const start = async () => {
        if (!current() || starting) return;
        starting = true;
        observer.next({ kind: 'status', status: 'connecting' });
        try {
          if (!connection) {
            // Hub JWT denial is distinct from browser Cookie-session expiry:
            // stop the lease without repeatedly replacing an otherwise valid session.
            connection = await this.connector(this.origin, token, () => terminate(false));
            if (!current()) {
              stop();
              return;
            }
            connection.on('ReceiveEntityChanged', (payload) => {
              if (!current()) return;
              const parsed = changeSchema.safeParse(payload);
              if (!parsed.success || seen.has(parsed.data.eventId.toLowerCase())) return;
              const eventId = parsed.data.eventId.toLowerCase();
              seen.add(eventId);
              if (seen.size > 512) seen.delete(seen.values().next().value!);
              observer.next({ kind: 'change', change: Object.freeze(parsed.data) });
            });
            connection.on('ReceiveTokenRevoked', () => terminate(true));
            connection.onclose(() => {
              connection = undefined;
              clearExpiryTimer();
              if (!starting) retry();
            });
          }
          await connection.start();
          if (!current()) {
            stop();
            return;
          }
          failures = 0;
          observer.next({ kind: 'status', status: 'connected' });
          observer.next({ kind: 'reconcile' });
        } catch (error) {
          if (!current()) return;
          const status = statusOf(error);
          if (status === 401 || status === 403) terminate(false);
          else retry();
        } finally {
          starting = false;
        }
      };
      void start();
      return () => {
        disposed = true;
        if (timer !== undefined) clearTimeout(timer);
        clearExpiryTimer();
        stop();
        seen.clear();
      };
    });
  }
}

function tokenExpiry(value: string): number | undefined {
  const payload = value.split('.')[1];
  if (!payload) return undefined;
  try {
    const normalized = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const parsed: unknown = JSON.parse(atob(normalized));
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'exp' in parsed &&
      typeof parsed.exp === 'number' &&
      Number.isFinite(parsed.exp)
    )
      return parsed.exp * 1000;
  } catch {
    // Opaque test tokens and malformed values are renewed on normal reconnect.
  }
  return undefined;
}

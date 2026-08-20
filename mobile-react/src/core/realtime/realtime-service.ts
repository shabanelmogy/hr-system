import * as signalR from '@microsoft/signalr';
import { z } from 'zod';

import { apiService } from '@/src/core/api';
import { ENV } from '@/src/core/config/env';

type RealtimeCallback = (...args: unknown[]) => void;
type ConnectionStateCallback = (connected: boolean, connecting: boolean) => void;

const realtimeTokenSchema = z.object({ token: z.string().min(1) });
const restartDelayMs = 5_000;

class RealtimeService {
  private connection: signalR.HubConnection | null = null;
  private readonly stateCallbacks = new Set<ConnectionStateCallback>();
  private readonly eventCallbacks = new Map<string, Set<RealtimeCallback>>();
  private startPromise: Promise<boolean> | null = null;
  private stopPromise: Promise<void> | null = null;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private enabled = false;
  private intentionallyStopped = false;
  private lifecycleRevision = 0;

  async setEnabled(enabled: boolean): Promise<void> {
    if (this.enabled === enabled) {
      if (enabled && this.connection?.state === signalR.HubConnectionState.Disconnected) {
        await this.startWhenReady();
      }
      return;
    }

    this.enabled = enabled;
    this.lifecycleRevision += 1;
    if (enabled) {
      this.intentionallyStopped = false;
      await this.startWhenReady();
      return;
    }

    await this.stop();
  }

  async start(): Promise<boolean> {
    if (!this.enabled || !ENV.isApiConfigured) return false;

    const connection = this.getConnection();
    if (connection.state === signalR.HubConnectionState.Connected) {
      this.notifyState(true, false);
      return true;
    }

    if (connection.state !== signalR.HubConnectionState.Disconnected) {
      this.notifyState(false, true);
      return false;
    }

    if (this.startPromise) return this.startPromise;

    this.intentionallyStopped = false;
    this.clearRestartTimer();
    this.notifyState(false, true);
    const startRevision = this.lifecycleRevision;
    this.startPromise = connection
      .start()
      .then(() => {
        if (!this.enabled || this.intentionallyStopped) return false;
        this.notifyState(true, false);
        return true;
      })
      .catch((error: unknown) => {
        this.notifyState(false, false);
        const canceledByLifecycle =
          startRevision !== this.lifecycleRevision ||
          !this.enabled ||
          this.intentionallyStopped;
        if (!canceledByLifecycle) {
          console.warn('[SignalR] Connection delayed', error);
          this.scheduleRestart();
        }
        return false;
      })
      .finally(() => {
        this.startPromise = null;
      });

    return this.startPromise;
  }

  async stop(): Promise<void> {
    this.intentionallyStopped = true;
    this.clearRestartTimer();

    if (!this.connection || this.connection.state === signalR.HubConnectionState.Disconnected) {
      this.notifyState(false, false);
      return;
    }

    if (!this.stopPromise) {
      const connection = this.connection;
      this.stopPromise = connection
        .stop()
        .catch((error: unknown) => {
          console.warn('[SignalR] Connection stop delayed', error);
        })
        .finally(() => {
          this.stopPromise = null;
        });
    }

    await this.stopPromise;
    this.notifyState(false, false);
  }

  on(eventName: string, callback: RealtimeCallback): void {
    const callbacks = this.eventCallbacks.get(eventName) ?? new Set<RealtimeCallback>();
    callbacks.add(callback);
    this.eventCallbacks.set(eventName, callbacks);
    this.connection?.on(eventName, callback);
  }

  off(eventName: string, callback: RealtimeCallback): void {
    this.eventCallbacks.get(eventName)?.delete(callback);
    this.connection?.off(eventName, callback);
  }

  subscribe(callback: ConnectionStateCallback): () => void {
    this.stateCallbacks.add(callback);
    callback(
      this.connection?.state === signalR.HubConnectionState.Connected,
      this.connection?.state === signalR.HubConnectionState.Connecting ||
        this.connection?.state === signalR.HubConnectionState.Reconnecting,
    );
    return () => this.stateCallbacks.delete(callback);
  }

  private getConnection(): signalR.HubConnection {
    if (this.connection) return this.connection;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(getHubUrl(), {
        accessTokenFactory: async () => {
          const response = await apiService.get<unknown>('auth/realtimeToken', {
            allowWhenReadOnly: true,
          });
          return realtimeTokenSchema.parse(response).token;
        },
      })
      .withAutomaticReconnect([0, 2_000, 5_000, 10_000, 30_000])
      // Lifecycle cancellation is handled by this service. SignalR's console logger
      // otherwise reports an intentional background stop as a negotiation error.
      .configureLogging(signalR.LogLevel.None)
      .build();

    for (const [eventName, callbacks] of this.eventCallbacks) {
      callbacks.forEach((callback) => connection.on(eventName, callback));
    }

    connection.onreconnecting(() => this.notifyState(false, true));
    connection.onreconnected(() => this.notifyState(true, false));
    connection.onclose((error) => {
      this.notifyState(false, false);
      if (error && this.enabled && !this.intentionallyStopped) {
        console.warn('[SignalR] Connection closed', error);
      }
      this.scheduleRestart();
    });
    this.connection = connection;
    return connection;
  }

  private scheduleRestart(): void {
    if (this.restartTimer || !this.enabled || this.intentionallyStopped) return;

    this.restartTimer = setTimeout(() => {
      this.restartTimer = null;
      void this.start();
    }, restartDelayMs);
  }

  private async startWhenReady(): Promise<void> {
    if (this.stopPromise) await this.stopPromise;
    if (this.startPromise) await this.startPromise;
    if (this.enabled) await this.start();
  }

  private clearRestartTimer(): void {
    if (!this.restartTimer) return;
    clearTimeout(this.restartTimer);
    this.restartTimer = null;
  }

  private notifyState(connected: boolean, connecting: boolean): void {
    this.stateCallbacks.forEach((callback) => callback(connected, connecting));
  }
}

function getHubUrl(): string {
  const apiRootUrl = ENV.apiUrl.replace(/\/api\/v\d+$/i, '');
  return `${apiRootUrl}/hubs/company`;
}

export const realtimeService = new RealtimeService();

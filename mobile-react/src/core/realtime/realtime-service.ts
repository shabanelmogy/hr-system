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
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private enabled = false;
  private intentionallyStopped = false;

  async setEnabled(enabled: boolean): Promise<void> {
    if (this.enabled === enabled) return;

    this.enabled = enabled;
    if (enabled) {
      this.intentionallyStopped = false;
      await this.start();
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
    this.startPromise = connection
      .start()
      .then(() => {
        this.notifyState(true, false);
        return true;
      })
      .catch((error: unknown) => {
        this.notifyState(false, false);
        console.warn('[SignalR] Connection delayed', error);
        this.scheduleRestart();
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

    if (
      this.connection &&
      this.connection.state !== signalR.HubConnectionState.Disconnected
    ) {
      await this.connection.stop();
    }

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
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    for (const [eventName, callbacks] of this.eventCallbacks) {
      callbacks.forEach((callback) => connection.on(eventName, callback));
    }

    connection.onreconnecting(() => this.notifyState(false, true));
    connection.onreconnected(() => this.notifyState(true, false));
    connection.onclose(() => {
      this.notifyState(false, false);
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

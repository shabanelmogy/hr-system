import * as signalR from "@microsoft/signalr";

const SIGNALR_TAG = "[SignalR]";
const RESTART_DELAY_MS = 5_000;
const TOKEN_EXPIRY_BUFFER_MS = 30_000;

type SignalRCallback = (...args: unknown[]) => void;
type ConnectionStateCallback = (connected: boolean, connecting: boolean) => void;

class SignalRService {
  private readonly connection: signalR.HubConnection;
  private readonly stateCallbacks = new Set<ConnectionStateCallback>();
  private startPromise: Promise<boolean> | null = null;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionallyStopped = false;
  private enabled = false;
  private cachedToken: { value: string; expiresAt: number } | null = null;
  private tokenPromise: Promise<string> | null = null;
  private tokenVersion = 0;

  constructor(hubUrl: string) {
    const options: signalR.IHttpConnectionOptions = {
      accessTokenFactory: () => this.fetchRealtimeToken(),
      withCredentials: false,
    };

    // The Next.js route handler cannot proxy WebSocket upgrades, so same-origin
    // hub requests use long polling and receive a fresh token for each request.
    if (hubUrl.startsWith("/api/hubs/")) {
      options.transport = signalR.HttpTransportType.LongPolling;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, options)
      .withAutomaticReconnect([0, 2_000, 5_000, 10_000, 30_000])
      .configureLogging(new SignalRLogger())
      .build();

    this.connection.onreconnecting(() => this.notifyState(false, true));
    this.connection.onreconnected(() => this.notifyState(true, false));
    this.connection.onclose(() => {
      this.notifyState(false, false);
      if (!this.intentionallyStopped) this.scheduleRestart();
    });

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        if (this.enabled) void this.start();
      });
      window.addEventListener("auth:logout", () => void this.setEnabled(false));
    }
  }

  async setEnabled(enabled: boolean): Promise<void> {
    if (this.enabled === enabled) return;

    this.enabled = enabled;
    if (enabled) {
      this.intentionallyStopped = false;
      await this.start();
      return;
    }

    this.tokenVersion += 1;
    this.cachedToken = null;
    this.tokenPromise = null;
    await this.stop();
  }

  async start(): Promise<boolean> {
    if (!this.enabled) return false;

    if (this.connection.state === signalR.HubConnectionState.Connected) {
      this.notifyState(true, false);
      return true;
    }

    if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
      this.notifyState(false, true);
      return false;
    }

    if (this.startPromise) return this.startPromise;

    this.intentionallyStopped = false;
    this.clearRestartTimer();
    this.notifyState(false, true);

    this.startPromise = this.startConnection().finally(() => {
      this.startPromise = null;
    });

    return this.startPromise;
  }

  async stop(): Promise<void> {
    this.intentionallyStopped = true;
    this.clearRestartTimer();

    if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
      await this.connection.stop();
    }

    // React development mode can disable and re-enable the provider while an
    // asynchronous stop is still finishing. Honor the latest desired state.
    if (this.enabled) {
      this.intentionallyStopped = false;
      void this.start();
      return;
    }

    this.notifyState(false, false);
  }

  on(eventName: string, callback: SignalRCallback) {
    this.connection.on(eventName, callback);
  }

  off(eventName: string, callback?: SignalRCallback) {
    if (callback) {
      this.connection.off(eventName, callback);
      return;
    }

    this.connection.off(eventName);
  }

  subscribe(callback: ConnectionStateCallback) {
    this.stateCallbacks.add(callback);
    callback(
      this.connection.state === signalR.HubConnectionState.Connected,
      this.connection.state === signalR.HubConnectionState.Connecting ||
        this.connection.state === signalR.HubConnectionState.Reconnecting,
    );
    return () => {
      this.stateCallbacks.delete(callback);
    };
  }

  private async startConnection(): Promise<boolean> {
    try {
      await this.connection.start();
      this.notifyState(true, false);
      return true;
    } catch (error) {
      this.notifyState(false, false);
      console.warn(`${SIGNALR_TAG} Connection delayed: ${getErrorMessage(error)}`);
      if (!this.intentionallyStopped) this.scheduleRestart();
      return false;
    }
  }

  private async fetchRealtimeToken(): Promise<string> {
    if (
      this.cachedToken &&
      this.cachedToken.expiresAt > Date.now() + TOKEN_EXPIRY_BUFFER_MS
    ) {
      return this.cachedToken.value;
    }

    if (this.tokenPromise) return this.tokenPromise;

    const request = this.requestRealtimeToken(this.tokenVersion);
    this.tokenPromise = request;
    const clearRequest = () => {
      if (this.tokenPromise === request) this.tokenPromise = null;
    };
    void request.then(clearRequest, clearRequest);
    return request;
  }

  private async requestRealtimeToken(tokenVersion: number): Promise<string> {
    const response = await fetch("/api/auth/realtime-token", {
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        this.cachedToken = null;
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
      throw new Error(`Realtime token request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { token?: unknown };
    if (typeof payload.token !== "string" || !payload.token) {
      throw new Error("Realtime token response did not contain a token");
    }

    if (this.enabled && tokenVersion === this.tokenVersion) {
      this.cachedToken = {
        value: payload.token,
        expiresAt: getJwtExpiration(payload.token),
      };
    }
    return payload.token;
  }

  private scheduleRestart() {
    if (
      this.restartTimer ||
      !this.enabled ||
      this.intentionallyStopped ||
      !navigator.onLine
    ) {
      return;
    }

    this.restartTimer = setTimeout(() => {
      this.restartTimer = null;
      void this.start();
    }, RESTART_DELAY_MS);
  }

  private clearRestartTimer() {
    if (!this.restartTimer) return;
    clearTimeout(this.restartTimer);
    this.restartTimer = null;
  }

  private notifyState(connected: boolean, connecting: boolean) {
    this.stateCallbacks.forEach((callback) => callback(connected, connecting));
  }
}

class SignalRLogger implements signalR.ILogger {
  log(logLevel: signalR.LogLevel, message: string): void {
    if (logLevel < signalR.LogLevel.Warning) return;

    // Authentication expiry during long polling is recoverable. Keep it visible
    // for diagnostics without turning it into a Next.js console-error overlay.
    console.warn(`${SIGNALR_TAG} ${message}`);
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getJwtExpiration(token: string): number {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return 0;

    const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    const payload = JSON.parse(atob(normalized + padding)) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp * 1_000 : 0;
  } catch {
    return 0;
  }
}

const hubUrl =
  process.env.NEXT_PUBLIC_SIGNALR_HUB_URL?.trim() || "/api/hubs/company";

const noopSignalRService = {
  async setEnabled() {},
  async start() {
    return false;
  },
  async stop() {},
  on() {},
  off() {},
  subscribe() {
    return () => {};
  },
} satisfies Pick<
  SignalRService,
  "setEnabled" | "start" | "stop" | "on" | "off" | "subscribe"
>;

const signalRService =
  typeof window !== "undefined" ? new SignalRService(hubUrl) : noopSignalRService;

export default signalRService;

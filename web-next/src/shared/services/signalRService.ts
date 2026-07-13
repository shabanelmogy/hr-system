import * as signalR from "@microsoft/signalr";

const isBrowser = () => typeof window !== "undefined";

const TOKEN_TAG = "[🔑 Token]";
const SIGNALR_TAG = "[📡 SignalR]";

function tokenPreview(token?: string) {
  if (!token) return "(empty)";
  return `${token.slice(0, 20)}…${token.slice(-8)} (${token.length} chars)`;
}

type SignalRCallback = (...args: unknown[]) => void;

class SignalRService {
  private readonly connection: signalR.HubConnection;
  private prefetchedToken: string | undefined;

  constructor(hubUrl: string) {
    const options: signalR.IHttpConnectionOptions = {
      accessTokenFactory: async () => {
        if (!isBrowser()) return "";

        if (this.prefetchedToken !== undefined) {
          const token = this.prefetchedToken;
          this.prefetchedToken = undefined;
          console.log(`${TOKEN_TAG} accessTokenFactory: using prefetched token: ${tokenPreview(token)}`);
          return token;
        }

        console.log(`${TOKEN_TAG} accessTokenFactory: no prefetched token, fetching fresh realtime token…`);
        const response = await fetch("/api/auth/realtime-token", { cache: "no-store" });
        if (!response.ok) {
          console.warn(`${TOKEN_TAG} accessTokenFactory: fetch failed with status ${response.status}`);
          return "";
        }

        const payload = (await response.json()) as { token?: string };
        console.log(`${TOKEN_TAG} accessTokenFactory: got fresh token: ${tokenPreview(payload.token)}`);
        return payload.token ?? "";
      },
      withCredentials: false
    };

    if (hubUrl.includes("runasp.net") || hubUrl.startsWith("/api/hubs/") || hubUrl === "/hubs/company") {
      options.transport = signalR.HttpTransportType.LongPolling;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, options)
      .withAutomaticReconnect()
      .build();
  }

  async start() {
    try {
      console.log(`${SIGNALR_TAG} start() called | connection state: ${this.connection.state}`);
      if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
        console.log(`${SIGNALR_TAG} start() skipped: state is ${this.connection.state}`);
        return;
      }

      if (isBrowser()) {
        console.log(`${TOKEN_TAG} Prefetching realtime token…`);
        const response = await fetch("/api/auth/realtime-token", { cache: "no-store" });
        console.log(`${TOKEN_TAG} Prefetch response: ${response.status} ${response.statusText}`);
        if (!response.ok) {
          console.warn(`${SIGNALR_TAG} Connection skipped: User not authenticated (status ${response.status}).`);
          return;
        }

        const payload = (await response.json()) as { token?: string };
        this.prefetchedToken = payload.token ?? "";
        console.log(`${TOKEN_TAG} Prefetched realtime token: ${tokenPreview(this.prefetchedToken)}`);
      }

      // Check again after async fetch to avoid race conditions if start() was called multiple times
      if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
        console.log(`${SIGNALR_TAG} start() aborted after prefetch: state changed to ${this.connection.state}`);
        return;
      }

      console.log(`${SIGNALR_TAG} Calling connection.start()…`);
      await this.connection.start();
      console.log(`${SIGNALR_TAG} ✅ Connected! State: ${this.connection.state}`);
    } catch (error) {
      console.error(`${SIGNALR_TAG} ❌ Connection Error:`, error);
    }
  }

  stop() {
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.stop().catch((error: unknown) => {
        console.error("Error stopping SignalR:", error);
      });
    }
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
}

const envHubUrl = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL?.trim() || null;
// Default to the /api/hubs proxy route so that:
//  1. Node.js handles TLS (NODE_TLS_REJECT_UNAUTHORIZED=0 works server-side).
//  2. The access_token query param flows through for backend JWT auth.
const hubUrl = envHubUrl || "/api/hubs/company";

const noopSignalRService = {
  async start() {},
  stop() {},
  on() {},
  off() {}
} satisfies Pick<SignalRService, "start" | "stop" | "on" | "off">;

const signalRService = isBrowser() ? new SignalRService(hubUrl) : noopSignalRService;

export default signalRService;

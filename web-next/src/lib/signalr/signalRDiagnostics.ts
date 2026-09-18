import { reportSignalRDiagnostic } from "@/lib/observability/clientTelemetry";

const DEFAULT_SUPPRESSION_WINDOW_MS = 30_000;
const RESTART_BACKOFF_MS = [5_000, 15_000, 30_000, 60_000] as const;

export type SignalRFailureKind =
  | "unauthorized"
  | "token"
  | "negotiation"
  | "timeout"
  | "network"
  | "transport"
  | "unknown";

export type SignalRDiagnosticPhase =
  | "start"
  | "reconnecting"
  | "closed"
  | "library";

type Warn = (message: string, details: Record<string, unknown>) => void;
type ReportTelemetry = (
  phase: SignalRDiagnosticPhase,
  failureKind: SignalRFailureKind,
  suppressedCount?: number,
) => void;

export function classifySignalRFailure(value: unknown): SignalRFailureKind {
  const message = getDiagnosticMessage(value).toLowerCase();

  if (/\b401\b|unauthori[sz]ed/.test(message)) return "unauthorized";
  if (
    message.includes("realtime token") ||
    message.includes("token request") ||
    message.includes("token response") ||
    message.includes("token became stale")
  ) {
    return "token";
  }
  if (message.includes("negotiat")) return "negotiation";
  if (message.includes("timeout") || message.includes("timed out")) return "timeout";
  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch failed")
  ) {
    return "network";
  }
  if (
    message.includes("websocket") ||
    message.includes("server-sent") ||
    message.includes("long polling") ||
    message.includes("longpoll") ||
    message.includes("transport")
  ) {
    return "transport";
  }

  return "unknown";
}

export function getSignalRRestartDelayMs(attempt: number): number {
  const safeAttempt = Number.isFinite(attempt) && attempt > 0
    ? Math.floor(attempt)
    : 0;
  return RESTART_BACKOFF_MS[Math.min(safeAttempt, RESTART_BACKOFF_MS.length - 1)];
}

export class SignalRDiagnosticReporter {
  private readonly lastReportedAt = new Map<string, number>();
  private readonly suppressedCounts = new Map<string, number>();

  constructor(
    private readonly now: () => number = Date.now,
    private readonly warn: Warn = (message, details) => console.warn(message, details),
    private readonly suppressionWindowMs = DEFAULT_SUPPRESSION_WINDOW_MS,
    private readonly reportTelemetry: ReportTelemetry = reportSignalRDiagnostic,
  ) {}

  report(phase: SignalRDiagnosticPhase, value: unknown) {
    const failureKind = classifySignalRFailure(value);
    const key = `${phase}:${failureKind}`;
    const currentTime = this.now();
    const previousTime = this.lastReportedAt.get(key);

    if (
      previousTime !== undefined &&
      currentTime - previousTime < this.suppressionWindowMs
    ) {
      this.suppressedCounts.set(key, (this.suppressedCounts.get(key) ?? 0) + 1);
      return;
    }

    const suppressedCount = this.suppressedCounts.get(key) ?? 0;
    this.suppressedCounts.delete(key);
    this.lastReportedAt.set(key, currentTime);

    this.warn("[SignalR] Connection diagnostic", {
      phase,
      failureKind,
      ...(suppressedCount > 0 ? { suppressedCount } : {}),
    });
    this.reportTelemetry(
      phase,
      failureKind,
      suppressedCount > 0 ? suppressedCount : undefined,
    );
  }

  reset() {
    this.lastReportedAt.clear();
    this.suppressedCounts.clear();
  }
}

function getDiagnosticMessage(value: unknown): string {
  if (value instanceof Error) return value.message;
  return typeof value === "string" ? value : "";
}

export const signalRDiagnostics = new SignalRDiagnosticReporter();

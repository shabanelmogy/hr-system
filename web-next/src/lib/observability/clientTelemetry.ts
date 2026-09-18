import {
  CLIENT_TELEMETRY_ENDPOINT,
  normalizeClientTelemetryEvent,
  type ClientErrorSource,
  type ClientErrorType,
  type ClientNavigationType,
  type SessionFailureKind,
  type SignalRTelemetryFailureKind,
  type SignalRTelemetryPhase,
} from "./clientTelemetryContract";

type WebVitalMetric = {
  name: string;
  value: number;
  delta: number;
  rating: string;
  navigationType: string;
};

let pendingNavigation: {
  navigationType: ClientNavigationType;
  startedAt: number;
} | null = null;

export function isClientTelemetryEnabled(): boolean {
  return process.env.NEXT_PUBLIC_WEB_TELEMETRY_ENABLED === "true";
}

export function reportClientError(source: ClientErrorSource, error: unknown): void {
  const candidate = normalizeClientTelemetryEvent({
    kind: "error",
    source,
    errorType: classifyClientError(error),
    digest: readErrorDigest(error),
  });

  if (candidate) sendClientTelemetry(candidate);
}

export function reportWebVital(metric: WebVitalMetric): void {
  const candidate = normalizeClientTelemetryEvent({
    kind: "web-vital",
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
  });

  if (candidate) sendClientTelemetry(candidate);
}

export function reportSessionRevalidationFailure(failureKind: SessionFailureKind): void {
  const candidate = normalizeClientTelemetryEvent({
    kind: "session",
    failureKind,
  });

  if (candidate) sendClientTelemetry(candidate);
}

export function reportSignalRDiagnostic(
  phase: SignalRTelemetryPhase,
  failureKind: SignalRTelemetryFailureKind,
  suppressedCount?: number,
): void {
  const candidate = normalizeClientTelemetryEvent({
    kind: "signalr",
    phase,
    failureKind,
    ...(suppressedCount === undefined ? {} : { suppressedCount }),
  });

  if (candidate) sendClientTelemetry(candidate);
}

export function beginClientNavigation(
  navigationType: ClientNavigationType,
  startedAt = currentTime(),
): void {
  if (!isClientTelemetryEnabled()) return;
  pendingNavigation = { navigationType, startedAt };
}

export function completeClientNavigation(completedAt = currentTime()): void {
  const navigation = pendingNavigation;
  pendingNavigation = null;
  if (!navigation || !isClientTelemetryEnabled()) return;

  const candidate = normalizeClientTelemetryEvent({
    kind: "navigation",
    navigationType: navigation.navigationType,
    durationMs: Math.max(0, completedAt - navigation.startedAt),
  });

  if (candidate) sendClientTelemetry(candidate);
}

export function classifyClientError(error: unknown): ClientErrorType {
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return "DOMException";
  }

  if (!(error instanceof Error)) return "unknown";

  switch (error.name) {
    case "Error":
    case "TypeError":
    case "ReferenceError":
    case "RangeError":
    case "SyntaxError":
    case "URIError":
    case "EvalError":
    case "AggregateError":
      return error.name;
    default:
      return "unknown";
  }
}

function sendClientTelemetry(event: ReturnType<typeof normalizeClientTelemetryEvent>): void {
  if (!event || !isClientTelemetryEnabled() || typeof fetch !== "function") return;

  void fetch(CLIENT_TELEMETRY_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
    credentials: "omit",
    referrerPolicy: "no-referrer",
    keepalive: true,
  }).catch(() => undefined);
}

function readErrorDigest(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("digest" in error)) return undefined;
  return typeof error.digest === "string" ? error.digest : undefined;
}

function currentTime(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

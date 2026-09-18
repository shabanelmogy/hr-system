export const CLIENT_TELEMETRY_ENDPOINT = "/api/telemetry/client";

const ERROR_SOURCES = [
  "window-error",
  "unhandled-rejection",
  "route-boundary",
  "global-boundary",
] as const;

const ERROR_TYPES = [
  "Error",
  "TypeError",
  "ReferenceError",
  "RangeError",
  "SyntaxError",
  "URIError",
  "EvalError",
  "AggregateError",
  "DOMException",
  "unknown",
] as const;

const WEB_VITAL_NAMES = ["CLS", "FCP", "FID", "INP", "LCP", "TTFB"] as const;
const WEB_VITAL_RATINGS = ["good", "needs-improvement", "poor"] as const;
const WEB_VITAL_NAVIGATION_TYPES = [
  "navigate",
  "reload",
  "back-forward",
  "back-forward-cache",
  "prerender",
  "restore",
] as const;
const NAVIGATION_TYPES = ["push", "replace", "traverse"] as const;
const SESSION_FAILURE_KINDS = ["unavailable", "invalid", "timeout", "network"] as const;
const SIGNALR_PHASES = ["start", "reconnecting", "closed", "library"] as const;
const SIGNALR_FAILURE_KINDS = [
  "unauthorized",
  "token",
  "negotiation",
  "timeout",
  "network",
  "transport",
  "unknown",
] as const;

const MAX_WEB_VITAL_VALUE = 86_400_000;
const MAX_NAVIGATION_DURATION_MS = 3_600_000;
const MAX_SUPPRESSED_DIAGNOSTICS = 10_000;
const SAFE_DIGEST_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

export type ClientErrorSource = (typeof ERROR_SOURCES)[number];
export type ClientErrorType = (typeof ERROR_TYPES)[number];
export type WebVitalName = (typeof WEB_VITAL_NAMES)[number];
export type WebVitalRating = (typeof WEB_VITAL_RATINGS)[number];
export type WebVitalNavigationType = (typeof WEB_VITAL_NAVIGATION_TYPES)[number];
export type ClientNavigationType = (typeof NAVIGATION_TYPES)[number];
export type SessionFailureKind = (typeof SESSION_FAILURE_KINDS)[number];
export type SignalRTelemetryPhase = (typeof SIGNALR_PHASES)[number];
export type SignalRTelemetryFailureKind = (typeof SIGNALR_FAILURE_KINDS)[number];

export type ClientTelemetryEvent =
  | {
      kind: "error";
      source: ClientErrorSource;
      errorType: ClientErrorType;
      digest?: string;
    }
  | {
      kind: "web-vital";
      name: WebVitalName;
      value: number;
      delta: number;
      rating: WebVitalRating;
      navigationType: WebVitalNavigationType;
    }
  | {
      kind: "navigation";
      navigationType: ClientNavigationType;
      durationMs: number;
    }
  | {
      kind: "session";
      failureKind: SessionFailureKind;
    }
  | {
      kind: "signalr";
      phase: SignalRTelemetryPhase;
      failureKind: SignalRTelemetryFailureKind;
      suppressedCount?: number;
    };

export function normalizeClientTelemetryEvent(value: unknown): ClientTelemetryEvent | null {
  if (!isRecord(value) || typeof value.kind !== "string") return null;

  switch (value.kind) {
    case "error": {
      if (!isOneOf(value.source, ERROR_SOURCES)) return null;

      return {
        kind: "error",
        source: value.source,
        errorType: isOneOf(value.errorType, ERROR_TYPES) ? value.errorType : "unknown",
        ...(isSafeDigest(value.digest) ? { digest: value.digest } : {}),
      };
    }
    case "web-vital": {
      if (
        !isOneOf(value.name, WEB_VITAL_NAMES) ||
        !isOneOf(value.rating, WEB_VITAL_RATINGS) ||
        !isOneOf(value.navigationType, WEB_VITAL_NAVIGATION_TYPES) ||
        !isFiniteInRange(value.value, 0, MAX_WEB_VITAL_VALUE) ||
        !isFiniteInRange(value.delta, -MAX_WEB_VITAL_VALUE, MAX_WEB_VITAL_VALUE)
      ) {
        return null;
      }

      return {
        kind: "web-vital",
        name: value.name,
        value: value.value,
        delta: value.delta,
        rating: value.rating,
        navigationType: value.navigationType,
      };
    }
    case "navigation": {
      if (
        !isOneOf(value.navigationType, NAVIGATION_TYPES) ||
        !isFiniteInRange(value.durationMs, 0, MAX_NAVIGATION_DURATION_MS)
      ) {
        return null;
      }

      return {
        kind: "navigation",
        navigationType: value.navigationType,
        durationMs: value.durationMs,
      };
    }
    case "session": {
      if (!isOneOf(value.failureKind, SESSION_FAILURE_KINDS)) return null;
      return {
        kind: "session",
        failureKind: value.failureKind,
      };
    }
    case "signalr": {
      const suppressedCount = value.suppressedCount;
      if (!isOneOf(value.phase, SIGNALR_PHASES)) return null;
      if (!isOneOf(value.failureKind, SIGNALR_FAILURE_KINDS)) return null;
      let normalizedSuppressedCount: number | undefined;
      if (suppressedCount !== undefined) {
        if (!isSafeIntegerInRange(suppressedCount, 1, MAX_SUPPRESSED_DIAGNOSTICS)) {
          return null;
        }
        normalizedSuppressedCount = suppressedCount;
      }

      return {
        kind: "signalr",
        phase: value.phase,
        failureKind: value.failureKind,
        ...(normalizedSuppressedCount !== undefined
          ? { suppressedCount: normalizedSuppressedCount }
          : {}),
      };
    }
    default:
      return null;
  }
}

function isSafeDigest(value: unknown): value is string {
  return typeof value === "string" && SAFE_DIGEST_PATTERN.test(value);
}

function isFiniteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isSafeIntegerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;
}

function isOneOf<const T extends readonly string[]>(value: unknown, values: T): value is T[number] {
  return typeof value === "string" && (values as readonly string[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

import { normalizeErrorDetails } from "./normalizeErrorDetails";
import type { ErrorDialogDetails, ErrorEnvironment } from "./types";

const DUPLICATE_WINDOW_MS = 750;
const listeners = new Set<() => void>();
let currentError: ErrorDialogDetails | null = null;
let lastErrorSignature = "";
let lastErrorTime = 0;

export function showErrorDialog(error: unknown, fallbackTitle?: string): void {
  if (typeof window === "undefined") return;

  const details = normalizeErrorDetails(error, fallbackTitle, {
    reportId: createReportId(),
    occurredAt: new Date().toISOString(),
    path: `${window.location.origin}${window.location.pathname}`,
    environment: getErrorEnvironment(),
  });
  const signature = JSON.stringify([
    details.title,
    details.messages,
    details.status,
    details.traceId,
    details.errorType,
    details.errorCodes,
    details.detail,
  ]);
  const now = Date.now();
  if (signature === lastErrorSignature && now - lastErrorTime < DUPLICATE_WINDOW_MS) {
    return;
  }

  lastErrorSignature = signature;
  lastErrorTime = now;
  currentError = details;
  emitChange();
}

export function dismissErrorDialog(reportId?: string): void {
  if (reportId && currentError?.reportId !== reportId) return;
  currentError = null;
  emitChange();
}

export function subscribeToErrorDialog(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getErrorDialogSnapshot(): ErrorDialogDetails | null {
  return currentError;
}

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function createReportId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getErrorEnvironment(): ErrorEnvironment | undefined {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return undefined;
  }

  return {
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "development",
    appLanguage: document.documentElement.lang || "unknown",
    browserLanguage: navigator.language || "unknown",
    direction: document.documentElement.dir || "ltr",
    theme: document.documentElement.dataset.theme || "unknown",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    browser: navigator.userAgent,
    platform: navigator.platform || "unknown",
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    screen: `${window.screen.width}x${window.screen.height}`,
    online: navigator.onLine,
  };
}

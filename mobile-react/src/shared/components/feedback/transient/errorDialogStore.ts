import { normalizeErrorDetails } from './normalizeErrorDetails';
import type { ErrorDialogDetails } from './types';

const duplicateWindowMs = 750;
const listeners = new Set<() => void>();
let currentError: ErrorDialogDetails | null = null;
let lastSignature = '';
let lastShownAt = 0;

export function showErrorDialog(error: unknown, fallbackTitle?: string): void {
  const details = normalizeErrorDetails(error, fallbackTitle);
  const signature = JSON.stringify([
    details.title,
    details.messages,
    details.status,
    details.traceId,
    details.correlationId,
  ]);
  const now = Date.now();

  if (signature === lastSignature && now - lastShownAt < duplicateWindowMs) return;

  lastSignature = signature;
  lastShownAt = now;
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

import type { ErrorDialogDetails } from './types';

export function normalizeErrorDetails(
  error: unknown,
  fallbackTitle?: string,
): ErrorDialogDetails {
  const runtime = {
    reportId: createReportId(),
    occurredAt: new Date().toISOString(),
  };

  if (typeof error === 'string') {
    return { ...runtime, title: fallbackTitle, messages: [error] };
  }

  if (Array.isArray(error)) {
    return { ...runtime, title: fallbackTitle, messages: toMessages(error) };
  }

  const value = asRecord(error);
  if (!value) {
    return { ...runtime, title: fallbackTitle, messages: [] };
  }

  const problem = asRecord(value.problem);
  const response = asRecord(value.response);
  const responseData = asRecord(response?.data);
  const source = problem ?? responseData ?? value;
  const detail = cleanString(source.detail) ?? cleanString(value.detail);
  const message = cleanString(source.message) ?? cleanString(value.message);
  const messages = toMessages(source.errors ?? source.messages ?? value.errors ?? value.messages);

  return {
    ...runtime,
    title: cleanString(fallbackTitle) ?? cleanString(source.title) ?? cleanString(value.title),
    messages: messages.length ? messages : uniqueMessages([detail, message]),
    status:
      finiteNumber(source.status) ??
      finiteNumber(value.status) ??
      finiteNumber(response?.status),
    traceId: cleanString(source.traceId) ?? cleanString(value.traceId),
    correlationId:
      cleanString(source.correlationId) ?? cleanString(value.correlationId),
    errorType:
      cleanString(source.type) ?? cleanString(value.name) ?? cleanString(value.type),
    errorCodes: toMessages(source.errorCodes ?? value.errorCodes),
    detail,
    stack: cleanString(value.stack),
  };
}

function toMessages(value: unknown): string[] {
  if (Array.isArray(value)) return uniqueMessages(value.flatMap(toMessages));
  const record = asRecord(value);
  if (record) return uniqueMessages(Object.values(record).flatMap(toMessages));
  return uniqueMessages([value]);
}

function uniqueMessages(values: readonly unknown[]): string[] {
  return Array.from(
    new Set(values.map(cleanString).filter((value): value is string => Boolean(value))),
  );
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined;
}

function cleanString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function createReportId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

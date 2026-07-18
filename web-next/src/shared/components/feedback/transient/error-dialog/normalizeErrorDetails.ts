import type { ErrorDialogDetails, ErrorRuntimeContext } from "./types";

export function normalizeErrorDetails(
  error: unknown,
  fallbackTitle?: string,
  runtime: ErrorRuntimeContext = {},
): ErrorDialogDetails {
  if (isErrorDialogDetails(error)) {
    return {
      ...error,
      title: cleanString(error.title) ?? cleanString(fallbackTitle),
      messages: uniqueMessages(error.messages),
      errorCodes: uniqueMessages(error.errorCodes),
      reportId: error.reportId ?? runtime.reportId,
      occurredAt: error.occurredAt ?? runtime.occurredAt,
      path: error.path ?? runtime.path,
      environment: error.environment ?? runtime.environment,
    };
  }

  const payload = normalizePayload(error, fallbackTitle);
  return { ...payload, ...runtime };
}

function normalizePayload(
  error: unknown,
  fallbackTitle?: string,
): Omit<ErrorDialogDetails, keyof ErrorRuntimeContext> {
  const title = cleanString(fallbackTitle);

  if (typeof error === "string") {
    return { title, messages: uniqueMessages([error]) };
  }

  if (Array.isArray(error)) {
    return { title, messages: toMessages(error) };
  }

  const value = asRecord(error);
  if (!value) return { title, messages: [] };

  const responseData = asRecord(asRecord(value.response)?.data);
  const source = responseData ?? value;
  const detail = cleanString(source.detail) ?? cleanString(value.detail);
  const message = cleanString(source.message) ?? cleanString(value.message);
  const errors = source.errors ?? value.errors ?? source.messages ?? value.messages;
  const messages = toMessages(errors);

  return {
    title: cleanString(source.title) ?? cleanString(value.title) ?? title,
    messages: messages.length > 0 ? messages : uniqueMessages([detail, message]),
    status: finiteNumber(source.status) ?? finiteNumber(value.status),
    traceId: cleanString(source.traceId) ?? cleanString(value.traceId),
    errorType: cleanString(source.type) ?? cleanString(value.type),
    errorCodes: toMessages(source.errorCodes ?? value.errorCodes),
    detail,
  };
}

function isErrorDialogDetails(value: unknown): value is ErrorDialogDetails {
  const record = asRecord(value);
  return Boolean(record && Array.isArray(record.messages));
}

function toMessages(value: unknown): string[] {
  if (Array.isArray(value)) return uniqueMessages(value.flatMap(toMessages));
  const record = asRecord(value);
  if (record) return uniqueMessages(Object.values(record).flatMap(toMessages));
  return uniqueMessages([value]);
}

function uniqueMessages(values: readonly unknown[] | undefined): string[] {
  if (!values) return [];
  return Array.from(
    new Set(values.map(cleanString).filter((value): value is string => Boolean(value))),
  );
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function cleanString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

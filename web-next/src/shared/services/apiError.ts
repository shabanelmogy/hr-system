type ErrorNotificationState = {
  open: true;
  messages: string[];
  severity: string;
  title: string;
  status?: number;
  traceId?: string;
};

const HandleApiError = (
  error: unknown,
  setNotification: (state: ErrorNotificationState) => void,
  severity = "error",
) => {
  const value = asRecord(error);
  const messages = normalizeMessages(value?.errors);
  const fallbackMessage =
    asString(value?.detail) ??
    asString(value?.message) ??
    "An unexpected error occurred.";

  setNotification({
    open: true,
    messages: messages.length > 0 ? messages : [fallbackMessage],
    severity,
    title: asString(value?.title) ?? "Error",
    status: asNumber(value?.status),
    traceId: asString(value?.traceId),
  });
};

function normalizeMessages(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(normalizeMessages);
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(normalizeMessages);
  }
  const message = asString(value);
  return message ? [message] : [];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export default HandleApiError;

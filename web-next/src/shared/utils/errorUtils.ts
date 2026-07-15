type UnknownRecord = Record<string, unknown>;

export const extractErrorMessage = (error: unknown): string =>
  extractErrorMessageSilent(error);

export const extractErrorMessageSilent = (error: unknown): string => {
  const root = asRecord(error);
  const response = asRecord(root?.response);
  const data = asRecord(response?.data);

  return (
    formatMessages(data?.errors) ??
    formatMessages(root?.errors) ??
    asNonEmptyString(data?.message) ??
    asNonEmptyString(data?.title) ??
    asNonEmptyString(root?.message) ??
    "An error occurred"
  );
};

export const extractValidationErrors = (
  error: unknown,
): Record<string, string> => {
  const errors = getResponseErrors(error);
  if (!errors) return {};

  return Object.fromEntries(
    Object.entries(errors)
      .map(([field, value]) => [field, formatMessages(value)] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
  );
};

export const isValidationError = (error: unknown): boolean =>
  getResponseStatus(error) === 400 && getResponseErrors(error) !== undefined;

export const isServerError = (error: unknown): boolean => {
  const status = getResponseStatus(error);
  return status !== null && status >= 500;
};

export const isNetworkError = (error: unknown): boolean => {
  const root = asRecord(error);
  return !asRecord(root?.response) && root?.message === "Network Error";
};

export const getErrorStatus = (error: unknown): number | null =>
  getResponseStatus(error);

function getResponseStatus(error: unknown): number | null {
  const response = asRecord(asRecord(error)?.response);
  return typeof response?.status === "number" ? response.status : null;
}

function getResponseErrors(error: unknown): UnknownRecord | undefined {
  const response = asRecord(asRecord(error)?.response);
  const data = asRecord(response?.data);
  const errors = asRecord(data?.errors);
  return errors && !Array.isArray(data?.errors) ? errors : undefined;
}

function formatMessages(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const messages = value.flatMap(collectMessages);
    return messages.length > 0 ? messages.join(", ") : undefined;
  }

  const record = asRecord(value);
  if (record) {
    const messages = Object.values(record).flatMap(collectMessages);
    return messages.length > 0 ? messages.join(", ") : undefined;
  }

  return asNonEmptyString(value);
}

function collectMessages(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(collectMessages);
  const record = asRecord(value);
  if (record) return Object.values(record).flatMap(collectMessages);
  const message = asNonEmptyString(value);
  return message ? [message] : [];
}

function asRecord(value: unknown): UnknownRecord | undefined {
  return value !== null && typeof value === "object"
    ? (value as UnknownRecord)
    : undefined;
}

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

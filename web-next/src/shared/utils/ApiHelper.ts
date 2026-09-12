
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function extractValue<T>(response: unknown): T {
  if (isRecord(response) && response.isSuccess === true && "value" in response) {
    return response.value as T;
  }
  if (isRecord(response) && "data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
}

/**
 * Extracts an array of values from an API response.
 */
export function extractValues<T>(response: unknown): T[] {
  const extracted = extractValue<T[]>(response);
  if (Array.isArray(extracted) && extracted.length > 0 && isRecord(extracted[0]) && "value" in extracted[0]) {
    return extracted.map((item) => extractValue<T>(item));
  }
  return extracted || [];
}

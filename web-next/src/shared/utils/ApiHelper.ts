
export function extractValue<T>(response: any): T {
  if (response?.value && response?.isSuccess) {
    return response.value;
  }
  if (response?.data) {
    return response.data;
  }
  return response as T;
}

/**
 * Extracts an array of values from an API response.
 */
export function extractValues<T>(response: any): T[] {
  const extracted = extractValue<T[]>(response);
  if (Array.isArray(extracted) && extracted.length > 0 && (extracted[0] as any)?.value !== undefined) {
    return extracted.map((item: any) => extractValue<T>(item));
  }
  return extracted || [];
}

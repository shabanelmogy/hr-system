export interface FormErrorSummaryItem {
  field: string;
  label: string;
  message: string;
}

/** Flattens React Hook Form's nested FieldErrors into paths understood by MyForm. */
export function toFormErrorMessages(
  value: unknown,
  prefix = "",
  result: Record<string, string> = {},
): Record<string, string> {
  if (!value || typeof value !== "object") return result;

  const record = value as Record<string, unknown>;
  if (prefix && typeof record.message === "string" && record.message.trim()) {
    result[prefix] = record.message;
  }

  for (const [key, child] of Object.entries(record)) {
    if (["message", "type", "ref", "types"].includes(key)) continue;
    toFormErrorMessages(child, prefix ? `${prefix}.${key}` : key, result);
  }

  return result;
}

export function getFormErrorSummary(
  errors: Record<string, string>,
  labels: Record<string, string> = {},
): FormErrorSummaryItem[] {
  return Object.entries(errors)
    .filter(([, message]) => message.trim().length > 0)
    .map(([field, message]) => ({
      field,
      label: labels[field] || field,
      message,
    }));
}

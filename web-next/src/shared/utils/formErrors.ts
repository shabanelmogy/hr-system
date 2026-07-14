import type {
  FieldPath,
  FieldValues,
  UseFormSetError,
} from "react-hook-form";

type ApiFieldError = {
  fieldErrors?: Record<string, string[]> | null;
  errors?: unknown;
  response?: {
    data?: {
      errors?: unknown;
    };
  };
};

type FieldAliases = Record<string, string | readonly string[]>;

/** Applies keyed API validation failures to RHF and returns unassigned messages. */
export function applyApiFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  aliases: FieldAliases = {},
): string[] {
  const value = asApiFieldError(error);
  const keyedErrors = value?.fieldErrors ?? readKeyedErrors(value);
  if (!keyedErrors) return normalizeMessages(value?.errors);

  const unassignedMessages: string[] = [];
  for (const [backendField, messages] of Object.entries(keyedErrors)) {
    const aliasedField =
      aliases[backendField] ??
      aliases[backendField.toLowerCase()] ??
      (backendField.includes(".") ? "" : toCamelCase(backendField));
    const message = messages.join(" ");

    if (!aliasedField) {
      unassignedMessages.push(message);
      continue;
    }

    const fieldNames = Array.isArray(aliasedField) ? aliasedField : [aliasedField];
    fieldNames.forEach((fieldName) => {
      setError(fieldName as FieldPath<TFieldValues>, {
        type: "server",
        message,
      });
    });
  }

  return unassignedMessages;
}

function asApiFieldError(value: unknown): ApiFieldError | undefined {
  return value && typeof value === "object" ? (value as ApiFieldError) : undefined;
}

function readKeyedErrors(
  value: ApiFieldError | undefined,
): Record<string, string[]> | null {
  const raw = value?.response?.data?.errors ?? value?.errors;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const entries = Object.entries(raw as Record<string, unknown>)
    .map(([field, messages]) => [field, normalizeMessages(messages)] as const)
    .filter(([, messages]) => messages.length > 0);

  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

function normalizeMessages(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(normalizeMessages);
  return typeof value === "string" && value.trim() ? [value.trim()] : [];
}

function toCamelCase(value: string): string {
  return value
    .split(".")
    .map((part) =>
      part ? `${part.charAt(0).toLowerCase()}${part.slice(1)}` : part,
    )
    .join(".");
}

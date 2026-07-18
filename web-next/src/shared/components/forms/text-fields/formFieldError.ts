import type { ReactNode } from "react";

export interface FormFieldError {
  message?: ReactNode;
}

export function getFormFieldError(
  errors: unknown,
  fieldName: string,
): FormFieldError | undefined {
  let current = errors;

  for (const segment of fieldName.split(".")) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  if (!current || typeof current !== "object") return undefined;
  return current as FormFieldError;
}

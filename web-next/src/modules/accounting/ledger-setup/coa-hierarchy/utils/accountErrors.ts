import { ApiClientError } from "@/lib/api/client";

const codeConflictCodes = new Set([
  "Accounting.Account.Duplicate",
  "UniqueConstraintViolation",
]);

export function isAccountCodeConflict(error: unknown): error is ApiClientError {
  return (
    error instanceof ApiClientError &&
    error.status === 409 &&
    Boolean(error.code && codeConflictCodes.has(error.code))
  );
}

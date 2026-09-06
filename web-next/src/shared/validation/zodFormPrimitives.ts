import { z } from "zod";

/** Converts the empty values emitted by form controls into an omitted value. */
export function normalizeOptionalFormValue(value: unknown): unknown {
  return value === "" || value === null || value === undefined
    ? undefined
    : value;
}

/** Optional positive database identifier accepted from a text/select control. */
export function optionalFormId() {
  return z.preprocess(
    (value) => value === 0 ? undefined : normalizeOptionalFormValue(value),
    z.coerce.number().int().positive().optional(),
  );
}

/** Optional non-negative numeric value accepted from a text/number control. */
export function optionalFormNonNegativeNumber() {
  return z.preprocess(
    normalizeOptionalFormValue,
    z.coerce.number().nonnegative().optional(),
  );
}

/** Boolean form value with an explicit default for an omitted control. */
export function formBoolean(defaultValue = false) {
  return z.preprocess(
    (value) => value === null || value === undefined ? defaultValue : value,
    z.boolean(),
  );
}

/** Optional email that treats blank input as omitted. */
export function optionalFormEmail(message: string) {
  return z.preprocess(
    (value) => {
      const trimmed = typeof value === "string" ? value.trim() : value;
      return normalizeOptionalFormValue(trimmed);
    },
    z.string().email(message).optional(),
  );
}

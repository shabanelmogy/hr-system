import { z } from "zod";
import type { LedgerSetupField } from "../types";

const optionalValue = z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]);

export function createLedgerSetupSchema(fields: readonly LedgerSetupField[], requiredMessage: string) {
  return z.object(Object.fromEntries(fields.map((field) => [
    field.name,
    field.required
      ? optionalValue.refine((value) => value !== "" && value !== null && value !== undefined && (field.type !== "number" || (Number.isFinite(Number(value)) && Number(value) >= (field.name === "priority" ? 0 : 1))), requiredMessage)
      : optionalValue,
  ]))).superRefine((values, context) => {
    if (fields.some((field) => field.name === "specificCurrencyId") && Number(values.currencyPolicy) === 3 && !values.specificCurrencyId) {
      context.addIssue({ code: "custom", path: ["specificCurrencyId"], message: requiredMessage });
    }
  });
}

export type LedgerSetupFormValues = Record<string, string | number | boolean | null | undefined>;

import { z } from "zod";

import { subscriptionStatuses } from "./types";

export interface TenantFormState {
  identifier: string;
  name: string;
  isActive: boolean;
  subscriptionStatus: (typeof subscriptionStatuses)[number];
  subscriptionStartedOn: string;
  subscriptionEndsOn: string;
  planName: string;
  maxAdmins: string;
  maxUsers: string;
  billingEmail: string;
  contactName: string;
  contactPhone: string;
  notes: string;
}

interface TenantValidationMessages {
  required: string;
  maxLength: (count: number) => string;
  invalidIdentifier: string;
  invalidOption: string;
  invalidDate: string;
  endDateBeforeStart: string;
  wholeNumberMin: (minimum: number) => string;
  invalidEmail: string;
}

export function createTenantValidationSchema(messages: TenantValidationMessages) {
  const optionalText = (maximum: number) =>
    z.string().trim().max(maximum, messages.maxLength(maximum));
  const integerAtLeast = (minimum: number) =>
    z
      .string()
      .trim()
      .min(1, messages.required)
      .refine(
        (value) => /^\d+$/.test(value) && Number(value) >= minimum,
        messages.wholeNumberMin(minimum),
      );

  return z
    .object({
      identifier: z
        .string()
        .trim()
        .min(1, messages.required)
        .max(100, messages.maxLength(100))
        .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*$/, messages.invalidIdentifier),
      name: z.string().trim().min(1, messages.required).max(200, messages.maxLength(200)),
      isActive: z.boolean(),
      subscriptionStatus: z.enum(subscriptionStatuses, { error: messages.invalidOption }),
      subscriptionStartedOn: z
        .string()
        .min(1, messages.required)
        .refine(isIsoDate, messages.invalidDate),
      subscriptionEndsOn: z
        .string()
        .min(1, messages.required)
        .refine(isIsoDate, messages.invalidDate),
      planName: optionalText(100),
      maxAdmins: integerAtLeast(1),
      maxUsers: integerAtLeast(0),
      billingEmail: optionalText(256).refine(
        (value) => !value || z.email().safeParse(value).success,
        messages.invalidEmail,
      ),
      contactName: optionalText(200),
      contactPhone: optionalText(32),
      notes: optionalText(2000),
    })
    .superRefine((value, context) => {
      if (
        isIsoDate(value.subscriptionStartedOn) &&
        isIsoDate(value.subscriptionEndsOn) &&
        value.subscriptionEndsOn < value.subscriptionStartedOn
      ) {
        context.addIssue({
          code: "custom",
          message: messages.endDateBeforeStart,
          path: ["subscriptionEndsOn"],
        });
      }
    }) satisfies z.ZodType<TenantFormState, TenantFormState>;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

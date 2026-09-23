import { z } from 'zod';
import type { LedgerSetupField, LedgerSetupFormValues } from '../../domain/models/ledger-setup';

export function createLedgerSetupSchema(fields: readonly LedgerSetupField[], requiredMessage: string): z.ZodType<LedgerSetupFormValues, LedgerSetupFormValues> {
  const shape: Record<string, z.ZodType> = {};
  for (const field of fields) {
    if (field.type === 'number' || field.type === 'select') {
      const numeric = z.preprocess(
        (value) => value === '' || value === null || value === undefined ? undefined : Number(value),
        field.required
          ? field.name === 'priority'
            ? z.number({ message: requiredMessage }).finite().nonnegative(requiredMessage)
            : z.number({ message: requiredMessage }).finite().positive(requiredMessage)
          : z.number().finite().positive().optional(),
      );
      shape[field.name] = numeric;
    } else if (field.type === 'boolean') {
      shape[field.name] = field.required ? z.boolean({ message: requiredMessage }) : z.boolean().optional();
    } else {
      const text = z.string().trim();
      shape[field.name] = field.required ? text.min(1, requiredMessage) : text.optional().transform((value) => value || undefined);
    }
  }
  return z.object(shape).superRefine((values, context) => {
    if (fields.some((field) => field.name === 'specificCurrencyId') && values.currencyPolicy === 3 && !values.specificCurrencyId) {
      context.addIssue({ code: 'custom', path: ['specificCurrencyId'], message: requiredMessage });
    }
  }) as unknown as z.ZodType<LedgerSetupFormValues, LedgerSetupFormValues>;
}

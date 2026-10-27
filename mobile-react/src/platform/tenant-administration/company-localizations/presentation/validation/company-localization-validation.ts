import { z } from 'zod';

import type { CompanyLocalizationLanguage } from '../../domain/models/company-localization';

export interface CompanyLocalizationTextFormValues {
  value: string;
}

export interface CompanyLocalizationDefaultFormValues {
  language: CompanyLocalizationLanguage;
}

const placeholders = /\{\{[^{}]+\}\}|\{\d+(?:[^{}]*)\}|<\/?\d+>/g;

export function hasMatchingPlaceholders(baseline: string, value: string): boolean {
  const extract = (text: string) => [...text.matchAll(placeholders)].map((match) => match[0]).sort();
  return JSON.stringify(extract(baseline)) === JSON.stringify(extract(value));
}

export function createCompanyLocalizationTextSchema(message: string, shippedValue?: string) {
  return z.object({
    value: z.string().max(4000, message)
      .refine((value) => value.trim().length > 0, message)
      .refine((value) => shippedValue === undefined || hasMatchingPlaceholders(shippedValue, value), message),
  });
}

export function createCompanyLocalizationDefaultSchema() {
  return z.object({ language: z.enum(['en', 'ar']) });
}

/** Appending this suffix does not alter {{named}}, {{-escaped}}, or {0} placeholders. */
export function createMockLocalizedValue(shippedValue: string, suffix: string): string {
  return `${shippedValue}${suffix}`;
}

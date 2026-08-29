import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createCompanyGeographicScopeFormSchema(t: TFunction) {
  return z.object({
    countryIds: z.array(z.number().int().positive())
      .min(1, t('companyGeographicScope.validation.countriesRequired'))
      .max(100, t('companyGeographicScope.validation.countryLimit')),
    registrationCountryId: z.number().int().positive(
      t('companyGeographicScope.validation.registrationRequired'),
    ),
    defaultCountryId: z.number().int().positive(
      t('companyGeographicScope.validation.defaultRequired'),
    ),
  }).superRefine((value, context) => {
    if (!value.countryIds.includes(value.registrationCountryId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['registrationCountryId'],
        message: t('companyGeographicScope.validation.registrationMustBeSelected'),
      });
    }
    if (!value.countryIds.includes(value.defaultCountryId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['defaultCountryId'],
        message: t('companyGeographicScope.validation.defaultMustBeSelected'),
      });
    }
  });
}

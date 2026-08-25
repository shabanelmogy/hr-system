import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createCompanyGeographicScopeFormSchema(t: TFunction) {
  return z.object({
    countryIds: z.array(z.number().int().positive())
      .min(1, t('companyGeographicScope.validation.countriesRequired'))
      .max(100, t('companyGeographicScope.validation.countryLimit')),
    defaultCountryId: z.number().int().positive(
      t('companyGeographicScope.validation.defaultRequired'),
    ),
  }).refine(
    (value) => value.countryIds.includes(value.defaultCountryId),
    {
      path: ['defaultCountryId'],
      message: t('companyGeographicScope.validation.defaultMustBeSelected'),
    },
  );
}

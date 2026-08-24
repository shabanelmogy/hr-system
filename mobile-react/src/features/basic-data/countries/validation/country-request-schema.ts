import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createCountryRequestSchema(t: TFunction) {
  const optionalPattern = (pattern: RegExp, message: string) =>
    z.string().trim().refine((value) => value.length === 0 || pattern.test(value), message);
  return z.object({
    nameAr: z.string().trim()
      .min(2, t('validation.minLength', { count: 2 }))
      .max(100, t('validation.maxLength', { count: 100 }))
      .regex(/^[\p{Script=Arabic}\s]+$/u, t('countries.nameArInvalid')),
    nameEn: z.string().trim()
      .min(2, t('validation.minLength', { count: 2 }))
      .max(100, t('validation.maxLength', { count: 100 }))
      .regex(/^[A-Za-z\s]+$/, t('countries.nameEnInvalid')),
    alpha2Code: optionalPattern(/^[A-Za-z]{2}$/, t('countries.alpha2Invalid')),
    alpha3Code: optionalPattern(/^[A-Za-z]{3}$/, t('countries.alpha3Invalid')),
    phoneCode: optionalPattern(/^\+?\d{1,10}$/, t('countries.phoneCodeInvalid')),
    currencyCode: optionalPattern(/^[A-Za-z]{3}$/, t('countries.currencyCodeInvalid')),
  });
}

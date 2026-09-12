import type { TFunction } from 'i18next';
import { z } from 'zod';
import { createGeographicalNameSchema } from '../../validation/geographical-name';

export function createCountryRequestSchema(t: TFunction) {
  const optionalPattern = (pattern: RegExp, message: string) =>
    z.string().trim().refine((value) => value.length === 0 || pattern.test(value), message);
  return z.object({
    nameAr: createGeographicalNameSchema(t),
    nameEn: createGeographicalNameSchema(t),
    alpha2Code: optionalPattern(/^[A-Za-z]{2}$/, t('countries.alpha2Invalid')),
    alpha3Code: optionalPattern(/^[A-Za-z]{3}$/, t('countries.alpha3Invalid')),
    phoneCode: optionalPattern(/^\+?\d{1,10}$/, t('countries.phoneCodeInvalid')),
    currencyCode: optionalPattern(/^[A-Za-z]{3}$/, t('countries.currencyCodeInvalid')),
  });
}

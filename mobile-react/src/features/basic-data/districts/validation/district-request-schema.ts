import type { TFunction } from 'i18next';
import { createGeographicalNameSchema } from '../../validation/geographical-name';
import { z } from 'zod';

export function createDistrictRequestSchema(t: TFunction) {
  return z.object({
    nameAr: createGeographicalNameSchema(t),
    nameEn: createGeographicalNameSchema(t),
    code: z.string().trim()
      .min(2, t('validation.minLength', { count: 2 }))
      .max(10, t('validation.maxLength', { count: 10 }))
      .regex(/^[A-Za-z0-9-]+$/, t('districts.codeInvalid')),
    stateId: z.number().int().positive(t('districts.stateRequired')),
  });
}

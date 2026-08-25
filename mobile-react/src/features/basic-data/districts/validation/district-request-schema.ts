import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createDistrictRequestSchema(t: TFunction) {
  return z.object({
    nameAr: z.string().trim()
      .min(2, t('validation.minLength', { count: 2 }))
      .max(100, t('validation.maxLength', { count: 100 }))
      .regex(/^[\p{Script=Arabic}\s]+$/u, t('districts.nameArInvalid')),
    nameEn: z.string().trim()
      .min(2, t('validation.minLength', { count: 2 }))
      .max(100, t('validation.maxLength', { count: 100 }))
      .regex(/^[A-Za-z\s]+$/, t('districts.nameEnInvalid')),
    code: z.string().trim()
      .min(2, t('validation.minLength', { count: 2 }))
      .max(10, t('validation.maxLength', { count: 10 }))
      .regex(/^[A-Za-z0-9_-]+$/, t('districts.codeInvalid')),
    stateId: z.number().int().positive(t('districts.stateRequired')),
  });
}

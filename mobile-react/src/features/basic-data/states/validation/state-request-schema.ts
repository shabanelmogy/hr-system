import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createStateRequestSchema(t: TFunction) {
  return z.object({
    nameAr: z.string().trim()
      .min(2, t('validation.minLength', { count: 2 }))
      .max(100, t('validation.maxLength', { count: 100 }))
      .regex(/^[\p{Script=Arabic}\s]+$/u, t('states.nameArInvalid')),
    nameEn: z.string().trim()
      .min(2, t('validation.minLength', { count: 2 }))
      .max(100, t('validation.maxLength', { count: 100 }))
      .regex(/^[A-Za-z\s]+$/, t('states.nameEnInvalid')),
    code: z.string().trim()
      .min(2, t('validation.minLength', { count: 2 }))
      .max(10, t('validation.maxLength', { count: 10 }))
      .regex(/^[A-Za-z0-9_-]+$/, t('states.codeInvalid')),
    countryId: z.number().int().positive(t('states.countryRequired')),
  });
}

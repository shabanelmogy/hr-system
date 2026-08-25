import type { TFunction } from 'i18next';
import { z } from 'zod';
export function createAddressTypeRequestSchema(t: TFunction) { return z.object({ nameAr: z.string().trim().min(2, t('validation.minLength', { count: 2 })).max(100, t('validation.maxLength', { count: 100 })).regex(/^[\p{Script=Arabic}\s]+$/u, t('addressTypes.nameArInvalid')), nameEn: z.string().trim().min(2, t('validation.minLength', { count: 2 })).max(100, t('validation.maxLength', { count: 100 })).regex(/^[A-Za-z\s]+$/, t('addressTypes.nameEnInvalid')) }); }

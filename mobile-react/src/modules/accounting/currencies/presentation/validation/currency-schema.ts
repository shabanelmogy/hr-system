import type { TFunction } from 'i18next';
import { z } from 'zod';

export const createCurrencySchema = (t: TFunction) => z.object({
  currencyCode: z.string().trim().length(3, t('currencies.validation.code')).regex(/^[A-Za-z]{3}$/, t('currencies.validation.code')),
  nameEn: z.string().trim().min(1, t('validation.required')).max(100, t('currencies.validation.name')),
  nameAr: z.string().trim().min(1, t('validation.required')).max(100, t('currencies.validation.name')),
  symbol: z.string().trim().min(1, t('validation.required')).max(10, t('currencies.validation.symbol')),
});

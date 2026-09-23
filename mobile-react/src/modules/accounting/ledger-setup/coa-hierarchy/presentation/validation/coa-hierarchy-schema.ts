import type { TFunction } from 'i18next';
import { z } from 'zod';

export const createAccountFormSchema = (t: TFunction) => z.object({
  code: z.string().trim().min(1, t('validation.required')).max(50, t('coaHierarchy.validation.codeLength')),
  nameAr: z.string().trim().min(1, t('validation.required')).max(200, t('coaHierarchy.validation.accountNameLength')),
  nameEn: z.string().trim().min(1, t('validation.required')).max(200, t('coaHierarchy.validation.accountNameLength')),
  accountHierarchyLevelId: z.number().int().positive(t('validation.required')),
  parentAccountId: z.number().int().nonnegative(),
  allowPosting: z.boolean(),
  manualPostingPolicy: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  currencyPolicy: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  specificCurrencyId: z.number().int().nonnegative(),
}).superRefine((value, context) => {
  if (value.currencyPolicy === 3 && value.specificCurrencyId <= 0) {
    context.addIssue({ code: 'custom', path: ['specificCurrencyId'], message: t('coaHierarchy.validation.specificCurrencyRequired') });
  }
});

export const createHierarchyLevelFormSchema = (t: TFunction) => z.object({
  levelNumber: z.number().int().positive(t('coaHierarchy.validation.levelNumber')),
  nameAr: z.string().trim().min(1, t('validation.required')).max(150, t('coaHierarchy.validation.levelNameLength')),
  nameEn: z.string().trim().min(1, t('validation.required')).max(150, t('coaHierarchy.validation.levelNameLength')),
  canPost: z.boolean(),
});

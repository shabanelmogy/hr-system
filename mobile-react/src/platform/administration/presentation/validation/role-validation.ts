import type { TFunction } from 'i18next';
import { z } from 'zod';

export const createRoleSchema = (t: TFunction) => z.object({
  name: z
    .string()
    .trim()
    .min(1, t('validation.required'))
    .min(3, t('validation.minLength', { count: 3 }))
    .max(50, t('validation.maxLength', { count: 50 })),
});

export const rolePermissionsSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(3).max(50),
  roleClaims: z.array(z.object({
    displayValue: z.string().trim().min(1),
    isSelected: z.boolean(),
  })),
});

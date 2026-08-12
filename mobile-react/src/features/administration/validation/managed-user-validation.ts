import type { TFunction } from 'i18next';
import { z } from 'zod';

const passwordPattern = /(?=.*[0-9])(?=.*[!@#$%^&*()\[\]{}\-_+=~`|:;"'<>,.\/?])(?=.*[a-z])(?=.*[A-Z]).{8,}/;

export function createManagedUserSchema(t: TFunction, isEdit: boolean) {
  return z.object({
    firstName: z.string().trim()
      .min(1, t('validation.required'))
      .min(3, t('validation.minLength', { count: 3 }))
      .max(50, t('validation.maxLength', { count: 50 })),
    lastName: z.string().trim()
      .min(1, t('validation.required'))
      .min(3, t('validation.minLength', { count: 3 }))
      .max(50, t('validation.maxLength', { count: 50 })),
    userName: z.string().trim()
      .min(1, t('validation.required'))
      .min(2, t('validation.minLength', { count: 2 }))
      .max(50, t('validation.maxLength', { count: 50 })),
    email: z.string().trim()
      .min(1, t('validation.required'))
      .max(100, t('validation.maxLength', { count: 100 }))
      .email(t('validation.invalidEmail')),
    password: z.string().max(50, t('validation.maxLength', { count: 50 })),
    confirmPassword: z.string(),
    roles: z.array(z.string()).min(1, t('userManagement.validation.roleRequired')),
    companyIds: z.array(z.number().int().positive())
      .min(1, t('userManagement.validation.companyRequired')),
    defaultCompanyId: z.number().int().positive(
      t('userManagement.validation.defaultCompanyRequired'),
    ),
  }).superRefine((values, context) => {
    if (!values.companyIds.includes(values.defaultCompanyId)) {
      context.addIssue({
        code: 'custom',
        path: ['defaultCompanyId'],
        message: t('userManagement.validation.defaultCompanySelected'),
      });
    }

    if (isEdit && !values.password) return;

    if (!values.password) {
      context.addIssue({
        code: 'custom',
        path: ['password'],
        message: t('validation.required'),
      });
      return;
    }

    if (!passwordPattern.test(values.password) || values.password.length < 8) {
      context.addIssue({
        code: 'custom',
        path: ['password'],
        message: t('userManagement.validation.passwordPolicy'),
      });
    }

    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: t('userManagement.validation.passwordMismatch'),
      });
    }
  });
}

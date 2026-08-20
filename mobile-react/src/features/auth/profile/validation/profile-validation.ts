import { z } from 'zod';
import type { TFunction } from 'i18next';

export function createProfileSchema(t: TFunction) {
  const requiredName = (field: string) =>
    z.string()
      .trim()
      .min(1, t('profile.required', { field }))
      .min(3, t('profile.fieldLength', { field }))
      .max(50, t('profile.fieldLength', { field }));

  return z.object({
    id: z.string(),
    firstName: requiredName(t('profile.firstName')),
    lastName: requiredName(t('profile.lastName')),
    userName: requiredName(t('profile.userName')),
  });
}

export function createChangePasswordSchema(t: TFunction) {
  const password = z.string().trim().min(1, t('profile.passwordRequired'));
  return z.object({
    currentPassword: password,
    newPassword: password
      .min(8, t('profile.passwordPolicy'))
      .regex(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\[\]{}\-_+=~`|:;"'<>,./?]).{8,}/, t('profile.passwordPolicy')),
    confirmPassword: password,
  }).refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: t('profile.passwordsMustMatch'),
  }).refine((value) => value.newPassword !== value.currentPassword, {
    path: ['newPassword'],
    message: t('profile.newPasswordMustDiffer'),
  });
}

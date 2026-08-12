import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { FieldErrors, FieldPath } from 'react-hook-form';

import { authApi } from '@/src/features/auth/api/auth-api';
import { asHref, ROUTES } from '@/src/core/constants/routes';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import {
  createRegisterValidationSchema,
  type RegisterFormData,
} from '@/src/features/auth/register/validation/registerValidation';
import { showToast } from '@/src/shared/components/feedback/transient';

const STEP_FIELDS: readonly (readonly FieldPath<RegisterFormData>[])[] = [
  ['firstName', 'lastName', 'userName'],
  ['email', 'password', 'confirmPassword'],
  [],
];

export interface RegisterProfileImage {
  base64: string;
  uri: string;
}

export function useRegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [profileImage, setProfileImage] = useState<RegisterProfileImage | null>(null);
  const validationSchema = useMemo(
    () =>
      createRegisterValidationSchema({
        required: t('validation.required'),
        minLength: (count) => t('validation.minLength', { count }),
        maxLength: (count) => t('validation.maxLength', { count }),
        invalidEmail: t('validation.invalidEmail'),
        invalidPassword: t('auth.passwordPolicy'),
        passwordsMustMatch: t('auth.passwordsMustMatch'),
      }),
    [t],
  );
  const form = useZodForm<RegisterFormData>(validationSchema, {
    defaultValues: {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const goNext = async () => {
    const valid = await form.trigger(STEP_FIELDS[activeStep]);
    if (valid) {
      setActiveStep((current) => Math.min(current + 1, STEP_FIELDS.length - 1));
    }
  };

  const goBack = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const goToCompletedStep = (step: number) => {
    if (step <= activeStep) {
      setActiveStep(step);
    }
  };

  const clearError = (name: string) => {
    form.clearErrors(name as FieldPath<RegisterFormData>);
  };

  const onInvalid = (errors: FieldErrors<RegisterFormData>) => {
    const invalidStep = STEP_FIELDS.findIndex((fields) => fields.some((field) => errors[field]));
    if (invalidStep >= 0) {
      setActiveStep(invalidStep);
    }
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      await authApi.register({
        firstName: values.firstName,
        lastName: values.lastName,
        userName: values.userName,
        email: values.email,
        password: values.password,
        profilePicture: profileImage?.base64 ?? null,
      });
      form.reset();
      setProfileImage(null);
      showToast.success(t('auth.registrationSuccessful'));
      router.replace(asHref(ROUTES.login));
    } catch (error) {
      showToast.error(error, t('auth.registrationFailed'));
    }
  }, onInvalid);

  return {
    activeStep,
    control: form.control,
    errors: form.formState.errors,
    formErrors: toFormErrorMap(form.formState.errors),
    goBack,
    goNext,
    goToCompletedStep,
    isSubmitting: form.formState.isSubmitting,
    password: form.watch('password'),
    profileImage,
    setProfileImage,
    submit,
    clearError,
  };
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import { useAuth } from '@/src/features/auth/context/AuthProvider';
import type { LoginAction, QuickLoginRole } from '@/src/features/auth/login/types';
import type { CompanySelectionResponse } from '@/src/features/auth/types/auth';
import {
  createLoginValidationSchema,
  type LoginFormData,
} from '@/src/features/auth/login/validation/loginValidation';

const DEV_CREDENTIALS = {
  user: { userName: 'user', password: 'P@ssword123' },
  admin: { userName: 'admin', password: 'P@ssword123' },
  superAdmin: { userName: 'superadmin', password: 'P@ssword123' },
} as const;

export function useLoginForm() {
  const { t } = useTranslation();
  const { signIn, selectCompany: completeCompanySelection } = useAuth();
  const submittingRef = useRef(false);
  const [companySelection, setCompanySelection] = useState<CompanySelectionResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<LoginAction | null>(null);
  const validationSchema = useMemo(
    () =>
      createLoginValidationSchema({
        userNameRequired: t('auth.userNameRequired'),
        userNameTooShort: t('auth.userNameTooShort'),
        userNameTooLong: t('auth.userNameTooLong'),
        passwordRequired: t('auth.passwordRequired'),
      }),
    [t],
  );
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting: isFormSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { userName: '', password: '' },
    resolver: zodResolver(validationSchema),
    mode: 'onChange',
  });

  const submitCredentials = async (credentials: LoginFormData, action: LoginAction) => {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setActiveAction(action);
    setServerError(null);
    try {
      const result = await signIn(credentials);
      if (result.kind === 'company-selection') {
        setCompanySelection(result.response);
      }
    } catch (error) {
      setServerError(getLoginErrorMessage(error, t('auth.loginFailed')));
    } finally {
      submittingRef.current = false;
      setActiveAction(null);
    }
  };

  const onSubmit = (credentials: LoginFormData) => submitCredentials(credentials, 'main');

  const loginAs = async (role: QuickLoginRole) => {
    if (submittingRef.current) {
      return;
    }

    const credentials = DEV_CREDENTIALS[role];
    setValue('userName', credentials.userName, { shouldDirty: true, shouldValidate: true });
    setValue('password', credentials.password, { shouldDirty: true, shouldValidate: true });
    await submitCredentials(credentials, role);
  };

  const selectCompany = async (companyId: number) => {
    if (!companySelection) {
      return;
    }

    setServerError(null);
    try {
      await completeCompanySelection(companySelection.companySelectionToken, companyId);
      setCompanySelection(null);
    } catch (error) {
      setServerError(getLoginErrorMessage(error, t('auth.loginFailed')));
    }
  };

  const cancelCompanySelection = () => {
    setCompanySelection(null);
    setServerError(null);
  };

  return {
    activeAction,
    cancelCompanySelection,
    companySelection,
    control,
    handleSubmit,
    isAnySubmitting: activeAction !== null || isFormSubmitting,
    isFormSubmitting,
    loginAs,
    onSubmit,
    selectCompany,
    serverError,
  };
}

function getLoginErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  return fallback;
}

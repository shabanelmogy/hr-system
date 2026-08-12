import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useZodForm } from '@/src/core/validation';
import { useAuth } from '@/src/features/auth/context/AuthProvider';
import type { LoginAction, QuickLoginRole } from '@/src/features/auth/login/types';
import type { CompanySelectionResponse } from '@/src/features/auth/types/auth';
import { showToast } from '@/src/shared/components/feedback/transient';
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
  } = useZodForm<LoginFormData>(validationSchema, {
    defaultValues: { userName: '', password: '' },
    mode: 'onChange',
  });

  const submitCredentials = async (credentials: LoginFormData, action: LoginAction) => {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setActiveAction(action);
    try {
      const result = await signIn(credentials);
      if (result.kind === 'company-selection') {
        setCompanySelection(result.response);
      }
    } catch (error) {
      showToast.error(error, t('auth.loginFailed'));
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

    try {
      await completeCompanySelection(companySelection.companySelectionToken, companyId);
      setCompanySelection(null);
    } catch (error) {
      showToast.error(error, t('auth.loginFailed'));
    }
  };

  const cancelCompanySelection = () => {
    setCompanySelection(null);
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
    serverError: null,
  };
}

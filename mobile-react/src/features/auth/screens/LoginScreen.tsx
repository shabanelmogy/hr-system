import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import { CompanySelectionModal } from '@/src/features/auth/components/CompanySelectionModal';
import { useAuth } from '@/src/features/auth/context/AuthProvider';
import {
  createLoginSchema,
  type LoginFormValues,
} from '@/src/features/auth/schemas/login-schema';
import type { CompanySelectionResponse } from '@/src/features/auth/types/auth';
import { AppButton, AppCard, AppIcon, AppText, FormTextField } from '@/src/shared/components';
import { useAppTheme } from '@/src/core/theme';

export function LoginScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { signIn, selectCompany } = useAuth();
  const [selection, setSelection] = useState<CompanySelectionResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const schema = useMemo(
    () =>
      createLoginSchema({
        userNameRequired: t('auth.userNameRequired'),
        passwordRequired: t('auth.passwordRequired'),
      }),
    [t],
  );
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { userName: '', password: '' },
    resolver: zodResolver(schema),
    mode: 'onSubmit',
  });

  const submit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const result = await signIn(values);
      if (result.kind === 'company-selection') {
        setSelection(result.response);
      }
    } catch (error) {
      setServerError(getLoginErrorMessage(error, t('auth.loginFailed')));
    }
  };

  const handleCompanySelect = async (companyId: number) => {
    if (!selection) {
      return;
    }

    setServerError(null);
    try {
      await selectCompany(selection.companySelectionToken, companyId);
      setSelection(null);
    } catch (error) {
      setServerError(getLoginErrorMessage(error, t('auth.loginFailed')));
    }
  };

  return (
    <>
      <AppCard style={styles.card}>
        <View style={styles.heading}>
          <View
            style={[
              styles.icon,
              { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.full },
            ]}>
            <AppIcon color={theme.colors.primary} name="person-outline" size={27} />
          </View>
          <AppText align="center" variant="title">
            {t('auth.welcome')}
          </AppText>
          <AppText align="center" color="muted" variant="bodySmall">
            {t('auth.subtitle')}
          </AppText>
        </View>

        {serverError ? (
          <View
            accessibilityLiveRegion="assertive"
            style={[
              styles.error,
              { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.danger },
            ]}>
            <AppIcon color={theme.colors.danger} name="alert-circle-outline" size={20} />
            <AppText color="danger" style={styles.errorText} variant="bodySmall">
              {serverError}
            </AppText>
          </View>
        ) : null}

        <View style={styles.form}>
          <FormTextField
            autoCapitalize="none"
            autoComplete="username"
            control={control}
            label={t('auth.userName')}
            name="userName"
            required
            returnKeyType="next"
          />
          <FormTextField
            autoCapitalize="none"
            autoComplete="current-password"
            control={control}
            label={t('auth.password')}
            name="password"
            required
            secureTextEntry
            onSubmitEditing={() => void handleSubmit(submit)()}
          />
          <AppButton
            fullWidth
            icon="log-in-outline"
            loading={isSubmitting}
            onPress={() => void handleSubmit(submit)()}>
            {t('auth.signIn')}
          </AppButton>
        </View>
      </AppCard>

      <CompanySelectionModal
        error={serverError}
        onClose={() => {
          setSelection(null);
          setServerError(null);
        }}
        onSelect={handleCompanySelect}
        selection={selection}
      />
    </>
  );
}

function getLoginErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  return fallback;
}

const styles = StyleSheet.create({
  card: {
    gap: 20,
  },
  heading: {
    alignItems: 'center',
    gap: 5,
  },
  icon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  form: {
    gap: 16,
  },
  error: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderStartWidth: 3,
    padding: 10,
  },
  errorText: {
    flex: 1,
  },
});

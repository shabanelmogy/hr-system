import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useTranslation } from 'react-i18next';

import { toApiError } from '@/src/core/api';
import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { layout, radius, spacing, useAppTheme } from '@/src/core/theme';
import { authApi } from '@/src/features/auth/api/auth-api';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppForm,
  AppIcon,
  AppStateView,
  AppText,
  AppTextField,
} from '@/src/shared/components';

type EmailAction = 'forgot' | 'resend';

export function ForgotPasswordScreen() {
  return <EmailActionScreen action="forgot" />;
}

export function ResendConfirmationScreen() {
  return <EmailActionScreen action="resend" />;
}

function EmailActionScreen({ action }: { action: EmailAction }) {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const [email, setEmail] = useState(() => readParam(params.email));
  const [emailError, setEmailError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const normalizedEmail = email.trim();
    if (!isEmail(normalizedEmail)) {
      setEmailError(t('validation.invalidEmail'));
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      if (action === 'forgot') await authApi.forgetPassword(normalizedEmail);
      else await authApi.resendConfirmationEmail(normalizedEmail);
      setSent(true);
    } catch (error) {
      setServerError(toApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const title = action === 'forgot'
    ? t('auth.forgotPasswordTitle')
    : t('auth.resendConfirmationTitle');
  const description = sent
    ? t('auth.emailActionSentDescription')
    : action === 'forgot'
      ? t('auth.forgotPasswordDescription')
      : t('auth.resendConfirmationDescription');

  return (
    <RecoveryShell
      description={description}
      icon={sent ? 'checkmark-circle-outline' : 'mail-outline'}
      title={title}>
      {sent ? (
        <AppAlert icon="mail-outline" severity="success">
          {t('auth.emailActionSent')}
        </AppAlert>
      ) : (
        <AppForm serverError={serverError} style={styles.form}>
          <AppTextField
            autoCapitalize="none"
            autoComplete="email"
            error={emailError}
            keyboardType="email-address"
            label={t('auth.email')}
            leadingIcon="mail-outline"
            name="email"
            onChangeText={(value) => {
              setEmail(value);
              setEmailError(undefined);
            }}
            onSubmitEditing={() => void submit()}
            required
            returnKeyType="send"
            value={email}
          />
          <AppButton
            fullWidth
            icon={action === 'forgot' ? 'paper-plane-outline' : 'refresh-outline'}
            loading={submitting}
            onPress={() => void submit()}>
            {action === 'forgot' ? t('auth.sendResetLink') : t('auth.resendConfirmation')}
          </AppButton>
        </AppForm>
      )}
      <BackToLoginButton />
    </RecoveryShell>
  );
}

export function ResetPasswordScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    email?: string | string[];
    code?: string | string[];
  }>();
  const [email, setEmail] = useState(() => readParam(params.email));
  const [code, setCode] = useState(() => readParam(params.code));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!isEmail(email.trim())) nextErrors.email = t('validation.invalidEmail');
    if (!code.trim()) nextErrors.code = t('validation.required');
    if (!isStrongPassword(newPassword)) nextErrors.newPassword = t('auth.passwordPolicy');
    if (newPassword !== confirmPassword) nextErrors.confirmPassword = t('auth.passwordsMustMatch');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await authApi.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });
      setComplete(true);
    } catch (error) {
      setServerError(toApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RecoveryShell
      description={complete
        ? t('auth.passwordResetCompleteDescription')
        : t('auth.resetPasswordDescription')}
      icon={complete ? 'checkmark-circle-outline' : 'key-outline'}
      title={t('auth.resetPassword')}>
      {complete ? (
        <AppAlert icon="checkmark-circle-outline" severity="success">
          {t('auth.passwordResetComplete')}
        </AppAlert>
      ) : (
        <AppForm errors={errors} serverError={serverError} style={styles.form}>
          <AppTextField
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label={t('auth.email')}
            leadingIcon="mail-outline"
            name="email"
            onChangeText={setEmail}
            required
            returnKeyType="next"
            value={email}
          />
          <AppTextField
            autoCapitalize="none"
            label={t('auth.recoveryCode')}
            leadingIcon="key-outline"
            name="code"
            onChangeText={setCode}
            required
            returnKeyType="next"
            value={code}
          />
          <AppTextField
            autoCapitalize="none"
            autoComplete="new-password"
            label={t('auth.newPassword')}
            leadingIcon="lock-closed-outline"
            name="newPassword"
            onChangeText={setNewPassword}
            required
            returnKeyType="next"
            secureTextEntry
            value={newPassword}
          />
          <AppTextField
            autoCapitalize="none"
            autoComplete="new-password"
            label={t('auth.confirmPassword')}
            leadingIcon="lock-closed-outline"
            name="confirmPassword"
            onChangeText={setConfirmPassword}
            onSubmitEditing={() => void submit()}
            required
            returnKeyType="send"
            secureTextEntry
            value={confirmPassword}
          />
          <AppButton
            fullWidth
            icon="lock-open-outline"
            loading={submitting}
            onPress={() => void submit()}>
            {t('auth.resetPassword')}
          </AppButton>
        </AppForm>
      )}
      <BackToLoginButton />
    </RecoveryShell>
  );
}

export function ConfirmEmailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    userId?: string | string[];
    code?: string | string[];
  }>();
  const userId = readParam(params.userId);
  const code = readParam(params.code);
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const confirm = useCallback(async () => {
    if (!userId || !code) {
      setState('error');
      setError(t('auth.invalidConfirmationLink'));
      return;
    }

    try {
      await authApi.confirmEmail({ userId, code });
      setState('success');
    } catch (confirmationError) {
      setState('error');
      setError(toApiError(confirmationError).message);
    }
  }, [code, t, userId]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void confirm();
  }, [confirm]);

  return (
    <RecoveryShell
      description={state === 'success'
        ? t('auth.emailConfirmedDescription')
        : t('auth.confirmingEmailDescription')}
      icon={state === 'success' ? 'checkmark-circle-outline' : 'mail-outline'}
      title={t('auth.confirmEmail')}>
      {state === 'loading' ? <AppStateView state="loading" /> : null}
      {state === 'success' ? (
        <AppAlert icon="checkmark-circle-outline" severity="success">
          {t('auth.emailConfirmed')}
        </AppAlert>
      ) : null}
      {state === 'error' ? (
        <AppAlert icon="alert-circle-outline" severity="error">
          {error ?? t('auth.invalidConfirmationLink')}
        </AppAlert>
      ) : null}
      <BackToLoginButton />
    </RecoveryShell>
  );
}

function RecoveryShell({
  children,
  description,
  icon,
  title,
}: PropsWithChildren<{ description: string; icon: Parameters<typeof AppIcon>[0]['name']; title: string }>) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <KeyboardAwareScrollView
      bottomOffset={12}
      contentContainerStyle={[styles.screen, { direction }]}
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <AppCard padding="lg" style={styles.card} variant="elevated">
        <View style={styles.heading}>
          <View style={[styles.icon, { backgroundColor: theme.colors.primary }]}> 
            <AppIcon color={theme.colors.onPrimary} name={icon} size={26} />
          </View>
          <AppText align="center" variant="titleSmall">{title}</AppText>
          <AppText align="center" color="muted" variant="bodySmall">{description}</AppText>
        </View>
        {children}
      </AppCard>
    </KeyboardAwareScrollView>
  );
}

function BackToLoginButton() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <AppButton
      fullWidth
      icon="arrow-back-outline"
      onPress={() => router.replace(asHref(ROUTES.login))}
      variant="ghost">
      {t('auth.backToSignIn')}
    </AppButton>
  );
}

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value: string): boolean {
  return value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) &&
    /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    alignSelf: 'center',
    gap: spacing.lg,
    maxWidth: layout.overlayMaxWidth,
    width: '100%',
  },
  heading: {
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  form: {
    gap: spacing.md,
  },
});

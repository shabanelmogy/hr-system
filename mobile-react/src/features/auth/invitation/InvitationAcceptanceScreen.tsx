import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useTranslation } from 'react-i18next';

import { toApiError } from '@/src/core/api';
import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { authApi } from '@/src/features/auth/api/auth-api';
import { AppAlert, AppButton, AppCard, AppForm, AppIcon, AppText, AppTextField } from '@/src/shared/components';

export function InvitationAcceptanceScreen() {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ invitationId?: string | string[]; token?: string | string[] }>();
  const invitationId = readParam(params.invitationId);
  const token = readParam(params.token);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!invitationId || !token) nextErrors.link = t('auth.invalidInvitationLink');
    if (!isStrongPassword(password)) nextErrors.password = t('auth.passwordPolicy');
    if (password !== confirmPassword) nextErrors.confirmPassword = t('auth.passwordsMustMatch');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await authApi.acceptInvitation({ invitationId, token, password });
      setComplete(true);
    } catch (error) {
      setServerError(toApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView bottomOffset={12} contentContainerStyle={[styles.screen, { direction }]} keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <AppCard padding="lg" style={styles.card} variant="elevated">
        <View style={styles.heading}>
          <View style={[styles.icon, { backgroundColor: theme.colors.primary }]}><AppIcon color={theme.colors.onPrimary} name={complete ? 'checkmark-circle-outline' : 'person-add-outline'} size={26} /></View>
          <AppText align="center" variant="titleSmall">{t('auth.acceptInvitation')}</AppText>
          <AppText align="center" color="muted" variant="bodySmall">{complete ? t('auth.invitationAcceptedDescription') : t('auth.acceptInvitationDescription')}</AppText>
        </View>
        {complete ? <AppAlert icon="checkmark-circle-outline" severity="success">{t('auth.invitationAccepted')}</AppAlert> : (
          <AppForm errors={errors} serverError={serverError} style={styles.form}>
            <AppTextField autoCapitalize="none" autoComplete="new-password" label={t('auth.newPassword')} leadingIcon="lock-closed-outline" maxLength={50} name="password" onChangeText={setPassword} required secureTextEntry value={password} />
            <AppTextField autoCapitalize="none" autoComplete="new-password" label={t('auth.confirmPassword')} leadingIcon="lock-closed-outline" maxLength={50} name="confirmPassword" onChangeText={setConfirmPassword} onSubmitEditing={() => void submit()} required returnKeyType="send" secureTextEntry value={confirmPassword} />
            <AppButton
              fullWidth
              icon="checkmark-circle-outline"
              loading={submitting}
              onPress={() => void submit()}>
              {t('auth.activateAccount')}
            </AppButton>
          </AppForm>
        )}
        <AppButton fullWidth icon="arrow-back-outline" onPress={() => router.replace(asHref(ROUTES.login))} variant="ghost">{t('auth.backToSignIn')}</AppButton>
      </AppCard>
    </KeyboardAwareScrollView>
  );
}

function readParam(value: string | string[] | undefined): string { return Array.isArray(value) ? value[0] ?? '' : value ?? ''; }
function isStrongPassword(value: string): boolean { return value.length >= 8 && value.length <= 50 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value); }
const styles = StyleSheet.create({ screen: { flexGrow: 1, justifyContent: 'center', padding: 16 }, card: { alignSelf: 'center', gap: 16, maxWidth: 520, width: '100%' }, heading: { alignItems: 'center', gap: 6 }, icon: { alignItems: 'center', borderRadius: 999, height: 48, justifyContent: 'center', width: 48 }, form: { gap: 12 } });

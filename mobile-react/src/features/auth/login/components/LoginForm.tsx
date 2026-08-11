import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';

import { useAppTheme } from '@/src/core/theme';
import type { useLoginForm } from '@/src/features/auth/login/hooks/useLoginForm';
import {
  AppButton,
  AppForm,
  AppIcon,
  AppText,
  AppTextField,
} from '@/src/shared/components';

interface LoginFormProps {
  compact: boolean;
  form: ReturnType<typeof useLoginForm>;
}

export function LoginForm({ compact, form }: LoginFormProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const submitForm = form.handleSubmit(form.onSubmit);

  return (
    <View style={[styles.card, { padding: compact ? 24 : 32 }]}>
      <View style={styles.heading}>
        <View
          style={[
            styles.icon,
            { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full },
          ]}>
          <AppIcon color={theme.colors.onPrimary} name="lock-closed-outline" size={27} />
        </View>
        <AppText align="center" variant="title">
          {t('auth.signIn')}
        </AppText>
        {compact ? (
          <AppText align="center" color="muted" variant="bodySmall">
            {t('auth.loginToAccessYourAccount')}
          </AppText>
        ) : null}
      </View>

      <AppForm
        serverError={form.serverError && !form.companySelection ? form.serverError : null}
        style={styles.form}>
        <Controller
          control={form.control}
          name="userName"
          render={({ field, fieldState }) => (
            <AppTextField
              autoCapitalize="none"
              autoComplete="username"
              error={fieldState.error?.message}
              label={t('auth.userName')}
              leadingIcon="person-outline"
              maxLength={50}
              name="userName"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              ref={field.ref}
              required
              returnKeyType="next"
              value={field.value}
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <AppTextField
              autoCapitalize="none"
              autoComplete="current-password"
              error={fieldState.error?.message}
              label={t('auth.password')}
              leadingIcon="lock-closed-outline"
              maxLength={50}
              name="password"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              onSubmitEditing={() => void submitForm()}
              ref={field.ref}
              required
              secureTextEntry
              value={field.value}
            />
          )}
        />
        <AppButton
          disabled={form.isAnySubmitting}
          fullWidth
          icon="log-in-outline"
          loading={form.activeAction === 'main' || (form.isFormSubmitting && !form.activeAction)}
          onPress={() => void submitForm()}>
          {t('auth.login')}
        </AppButton>

        <View style={styles.quickAccessHeading}>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <AppText color="muted" variant="caption">
            {t('auth.quickAccess')}
          </AppText>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        </View>

        <View
          style={[
            styles.quickActions,
            compact ? styles.quickActionsCompact : styles.quickActionsWide,
          ]}>
          <AppButton
            disabled={form.isAnySubmitting}
            fullWidth={compact}
            icon="person-outline"
            loading={form.activeAction === 'user'}
            onPress={() => void form.loginAs('user')}
            style={[
              styles.quickButton,
              compact ? styles.quickButtonCompact : styles.quickButtonWide,
            ]}
            variant="outline">
            {t('auth.loginAsUser')}
          </AppButton>
          <View
            style={[
              styles.adminButtonShell,
              compact ? styles.quickButtonCompact : styles.quickButtonWide,
            ]}>
            <AppButton
              disabled={form.isAnySubmitting}
              fullWidth
              gradientColors={['#F44336', '#E91E63']}
              icon="shield-outline"
              loading={form.activeAction === 'admin'}
              onPress={() => void form.loginAs('admin')}
              pressedGradientColors={['#D32F2F', '#C2185B']}
              style={styles.adminButton}
              variant="danger">
              {t('auth.loginAsAdmin')}
            </AppButton>
          </View>
          <View
            style={[
              styles.superAdminButtonShell,
              compact ? styles.quickButtonCompact : styles.quickButtonWide,
            ]}>
            <AppButton
              disabled={form.isAnySubmitting}
              fullWidth
              gradientColors={['#7C3AED', '#4F46E5']}
              icon="diamond-outline"
              loading={form.activeAction === 'superAdmin'}
              onPress={() => void form.loginAs('superAdmin')}
              pressedGradientColors={['#6D28D9', '#4338CA']}
              style={styles.adminButton}>
              {t('auth.loginAsSuperAdmin')}
            </AppButton>
          </View>
        </View>
      </AppForm>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1.35,
    justifyContent: 'center',
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
  quickAccessHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  quickActions: {
    gap: 12,
  },
  quickActionsCompact: {
    flexDirection: 'column',
  },
  quickActionsWide: {
    flexDirection: 'row',
  },
  quickButton: {
    minHeight: 48,
    borderRadius: 8,
  },
  quickButtonCompact: {
    width: '100%',
  },
  quickButtonWide: {
    flex: 1,
    minWidth: 0,
  },
  adminButtonShell: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 5,
  },
  superAdminButtonShell: {
    backgroundColor: '#6D28D9',
    borderRadius: 8,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 5,
  },
  adminButton: {
    minHeight: 48,
    borderWidth: 0,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});

import { StyleSheet, View } from 'react-native';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { RegisterFormData } from '@/src/features/auth/register/validation/registerValidation';
import { AppTextField } from '@/src/shared/components';
import { PasswordRequirements } from './PasswordRequirements';

interface SecurityStepProps {
  control: Control<RegisterFormData>;
  password: string;
}

export function SecurityStep({ control, password }: SecurityStepProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.fields}>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <AppTextField
              autoCapitalize="none"
              autoComplete="email"
              autoFocus
              error={fieldState.error?.message}
              inputMode="email"
              keyboardType="email-address"
              label={t('auth.email')}
              leadingIcon="mail-outline"
              maxLength={254}
              name="email"
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
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <AppTextField
              autoCapitalize="none"
              autoComplete="new-password"
              error={fieldState.error?.message}
              label={t('auth.password')}
              leadingIcon="lock-closed-outline"
              maxLength={128}
              name="password"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              ref={field.ref}
              required
              returnKeyType="next"
              secureTextEntry
              value={field.value}
            />
          )}
        />
        <PasswordRequirements password={password} />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <AppTextField
              autoCapitalize="none"
              autoComplete="new-password"
              error={fieldState.error?.message}
              label={t('auth.confirmPassword')}
              leadingIcon="shield-checkmark-outline"
              maxLength={128}
              name="confirmPassword"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              ref={field.ref}
              required
              secureTextEntry
              value={field.value}
            />
          )}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 10,
  },
});

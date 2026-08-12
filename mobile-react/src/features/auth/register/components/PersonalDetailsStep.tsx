import { StyleSheet, View } from 'react-native';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { RegisterFormData } from '@/src/features/auth/register/validation/registerValidation';
import { AppTextField } from '@/src/shared/components';

interface PersonalDetailsStepProps {
  control: Control<RegisterFormData>;
}

export function PersonalDetailsStep({ control }: PersonalDetailsStepProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.fields}>
        <Controller
          control={control}
          name="firstName"
          render={({ field, fieldState }) => (
            <AppTextField
              autoCapitalize="words"
              autoComplete="given-name"
              autoFocus
              error={fieldState.error?.message}
              label={t('auth.firstName')}
              leadingIcon="person-outline"
              maxLength={50}
              name="firstName"
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
          name="lastName"
          render={({ field, fieldState }) => (
            <AppTextField
              autoCapitalize="words"
              autoComplete="family-name"
              error={fieldState.error?.message}
              label={t('auth.lastName')}
              leadingIcon="person-outline"
              maxLength={50}
              name="lastName"
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
          name="userName"
          render={({ field, fieldState }) => (
            <AppTextField
              autoCapitalize="none"
              autoComplete="username"
              error={fieldState.error?.message}
              label={t('auth.userName')}
              leadingIcon="at-outline"
              maxLength={50}
              name="userName"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              ref={field.ref}
              required
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

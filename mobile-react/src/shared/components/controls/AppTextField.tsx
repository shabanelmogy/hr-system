import { forwardRef, useId, useState } from 'react';
import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface AppTextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const AppTextField = forwardRef<TextInput, AppTextFieldProps>(function AppTextField(
  {
    label,
    error,
    helperText,
    required = false,
    secureTextEntry = false,
    editable = true,
    style,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isRTL, direction } = useLocalization();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputId = useId();
  const supportingText = error ?? helperText;

  return (
    <View style={[styles.field, { direction }]}>
      <AppText nativeID={`${inputId}-label`} variant="label">
        {label}
        {required ? <AppText color="danger"> *</AppText> : null}
      </AppText>
      <View
        style={[
          styles.inputContainer,
          {
            direction,
            backgroundColor: editable ? theme.colors.surface : theme.colors.surfaceMuted,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.sm,
          },
        ]}>
        <TextInput
          {...props}
          accessibilityHint={supportingText}
          accessibilityLabel={`${label}${required ? `, ${t('common.required')}` : ''}`}
          aria-invalid={Boolean(error)}
          editable={editable}
          ref={ref}
          secureTextEntry={secureTextEntry && !passwordVisible}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              textAlign: isRTL ? 'right' : 'left',
              writingDirection: isRTL ? 'rtl' : 'ltr',
            },
            style,
          ]}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityLabel={t(passwordVisible ? 'fields.hidePassword' : 'fields.showPassword')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={styles.passwordButton}>
            <AppIcon
              color={theme.colors.textMuted}
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={21}
            />
          </Pressable>
        ) : null}
      </View>
      {supportingText ? (
        <AppText color={error ? 'danger' : 'muted'} variant="caption">
          {supportingText}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: 6,
  },
  inputContainer: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  passwordButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

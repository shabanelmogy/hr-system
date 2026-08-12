import {
  type StyleProp,
  StyleSheet,
  Switch,
  type SwitchProps,
  View,
  type ViewStyle,
} from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useAppFormField } from '@/src/shared/components/forms/AppForm';
import { AppFieldMessage } from '@/src/shared/components/forms/AppFieldMessage';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';

export interface AppSwitchFieldProps extends Omit<SwitchProps, 'style'> {
  name?: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  icon?: AppIconName;
  style?: StyleProp<ViewStyle>;
}

export function AppSwitchField({
  name,
  label,
  description,
  error: suppliedError,
  required = false,
  icon,
  disabled,
  style,
  trackColor,
  onValueChange,
  ...switchProps
}: AppSwitchFieldProps) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { isReadOnly } = useAppReadOnly();
  const effectiveDisabled = Boolean(disabled) || isReadOnly;
  const formField = useAppFormField(name, () => {}, { autoFocus: false, enabled: false });
  const error = suppliedError ?? formField.error;

  return (
    <View style={styles.field}>
      <View
        style={[
          styles.row,
          {
            direction,
            backgroundColor: theme.colors.surfaceMuted,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            opacity: effectiveDisabled ? 0.55 : 1,
          },
          style,
        ]}>
        {icon ? (
          <View style={[styles.icon, { borderRadius: theme.radius.sm }]}>
            <AppIcon color={theme.colors.primary} name={icon} size={21} />
          </View>
        ) : null}
        <View style={styles.labelGroup}>
          <AppText variant="label">
            {label}
            {required ? <AppText color="danger"> *</AppText> : null}
          </AppText>
          {description ? (
            <AppText color="muted" variant="caption">
              {description}
            </AppText>
          ) : null}
        </View>
        <Switch
          {...switchProps}
          accessibilityLabel={label}
          disabled={effectiveDisabled}
          onValueChange={(nextValue) => {
            formField.clearError();
            onValueChange?.(nextValue);
          }}
          trackColor={trackColor ?? {
            false: theme.colors.disabled,
            true: theme.colors.primary,
          }}
        />
      </View>
      {error ? (
        <AppFieldMessage error>{error}</AppFieldMessage>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: 4,
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  labelGroup: {
    flex: 1,
    gap: 2,
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

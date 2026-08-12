import { useMemo, useState } from 'react';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useAppFormField } from '@/src/shared/components/forms/AppForm';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppCard } from '@/src/shared/components/surfaces/AppCard';
import { AppModal } from '@/src/shared/components/surfaces/AppModal';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface AppSelectOption<Value extends string> {
  value: Value;
  label: string;
  icon: AppIconName;
  description?: string;
  disabled?: boolean;
}

export interface AppSelectFieldProps<Value extends string> {
  name?: string;
  label: string;
  options: readonly AppSelectOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  leadingIcon?: AppIconName;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
}

export function AppSelectField<Value extends string>({
  name,
  label,
  options,
  value,
  onChange,
  leadingIcon,
  placeholder,
  required = false,
  disabled = false,
  error: suppliedError,
  helperText,
  style,
}: AppSelectFieldProps<Value>) {
  const { t } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(false);
  const formField = useAppFormField(
    name,
    () => {
      if (!disabled) setOpen(true);
    },
    { autoFocus: false, enabled: !disabled },
  );
  const error = suppliedError ?? formField.error;
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );
  const supportingText = error ?? helperText;
  const selectedIcon = selectedOption?.icon ?? leadingIcon;

  return (
    <View style={[styles.field, open && styles.focusedField, style]}>
      <View style={styles.outlineWrapper}>
        <Pressable
          accessibilityLabel={label}
          accessibilityRole="button"
          accessibilityState={{ disabled, expanded: open }}
          disabled={disabled}
          onPress={() => setOpen(true)}
          style={[
            styles.control,
            {
              direction,
              backgroundColor: disabled ? theme.colors.surfaceMuted : theme.colors.surface,
              borderColor: error
                ? theme.colors.danger
                : open
                  ? theme.colors.primary
                  : theme.colors.border,
              borderRadius: theme.radius.md,
              borderWidth: open ? 2 : 1,
              opacity: disabled ? 0.55 : 1,
            },
          ]}>
          {selectedIcon ? (
            <View style={styles.leadingIcon}>
              <AppIcon color={theme.colors.primary} name={selectedIcon} size={21} />
            </View>
          ) : null}
          <AppText
            color={selectedOption ? 'default' : 'muted'}
            numberOfLines={1}
            style={styles.value}
            variant="body">
            {selectedOption?.label ?? placeholder ?? label}
          </AppText>
          <AppIcon
            color={theme.colors.textMuted}
            name={isRTL ? 'chevron-back' : 'chevron-down'}
            size={20}
          />
        </Pressable>
        <View
          pointerEvents="none"
          style={[
            styles.floatingLabel,
            isRTL ? styles.floatingLabelRtl : styles.floatingLabelLtr,
            { backgroundColor: disabled ? theme.colors.surfaceMuted : theme.colors.surface },
          ]}>
          <AppText
            color={error ? 'danger' : open ? 'primary' : 'default'}
            variant="caption"
            weight="500">
            {label}
            {required ? <AppText color="danger"> *</AppText> : null}
          </AppText>
        </View>
      </View>
      {supportingText ? (
        <AppText color={error ? 'danger' : 'muted'} style={styles.supportingText} variant="caption">
          {supportingText}
        </AppText>
      ) : null}

      <AppModal
        closeLabel={t('common.cancel')}
        onClose={() => setOpen(false)}
        title={label}
        visible={open}>
        <View style={styles.options}>
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <AppCard
                accessibilityLabel={option.label}
                disabled={option.disabled}
                key={option.value}
                onPress={() => {
                  formField.clearError();
                  onChange(option.value);
                  setOpen(false);
                }}
                padding="md"
                style={[styles.option, selected && { borderColor: theme.colors.primary }]}
                variant={selected ? 'filled' : 'outlined'}>
                <View style={[styles.optionContent, { direction }]}>
                  <View
                    style={[
                      styles.optionIcon,
                      { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
                    ]}>
                    <AppIcon color={theme.colors.primary} name={option.icon} size={22} />
                  </View>
                  <View style={styles.optionText}>
                    <AppText variant="label">{option.label}</AppText>
                    {option.description ? (
                      <AppText color="muted" variant="caption">
                        {option.description}
                      </AppText>
                    ) : null}
                  </View>
                  {selected ? (
                    <AppIcon color={theme.colors.primary} name="checkmark-circle" size={21} />
                  ) : null}
                </View>
              </AppCard>
            );
          })}
        </View>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: 4,
  },
  focusedField: {
    paddingTop: 8,
  },
  outlineWrapper: {
    position: 'relative',
    paddingTop: 7,
  },
  control: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingEnd: 14,
  },
  leadingIcon: {
    width: 42,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    flex: 1,
    minWidth: 0,
  },
  floatingLabel: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    maxWidth: '75%',
    paddingHorizontal: 5,
  },
  floatingLabelLtr: { left: 12 },
  floatingLabelRtl: { right: 12 },
  supportingText: { paddingHorizontal: 12 },
  options: { gap: 10 },
  option: { minHeight: 64 },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
});

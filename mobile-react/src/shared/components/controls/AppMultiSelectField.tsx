import { useMemo, useState } from 'react';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useAppFormField } from '@/src/shared/components/forms/AppForm';
import { AppFieldMessage } from '@/src/shared/components/forms/AppFieldMessage';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppModal } from '@/src/shared/components/surfaces/AppModal';
import { AppText } from '@/src/shared/components/typography/AppText';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';

export interface AppMultiSelectOption<Value extends string | number> {
  value: Value;
  label: string;
  icon?: AppIconName;
  description?: string;
  disabled?: boolean;
}

export interface AppMultiSelectFieldProps<Value extends string | number> {
  name?: string;
  label: string;
  options: readonly AppMultiSelectOption<Value>[];
  values: readonly Value[];
  onChange: (values: Value[]) => void;
  leadingIcon?: AppIconName;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
}

export function AppMultiSelectField<Value extends string | number>({
  name,
  label,
  options,
  values,
  onChange,
  leadingIcon,
  placeholder,
  required = false,
  disabled = false,
  error: suppliedError,
  helperText,
  style,
}: AppMultiSelectFieldProps<Value>) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { isReadOnly } = useAppReadOnly();
  const [open, setOpen] = useState(false);
  const effectiveDisabled = disabled || isReadOnly;
  const formField = useAppFormField(
    name,
    () => {
      if (!effectiveDisabled) setOpen(true);
    },
    { autoFocus: false, enabled: !effectiveDisabled },
  );
  const error = suppliedError ?? formField.error;
  const selectedLabels = useMemo(
    () => options.filter((option) => values.includes(option.value)).map((option) => option.label),
    [options, values],
  );
  const valueLabel = selectedLabels.length > 0
    ? selectedLabels.join(', ')
    : placeholder ?? label;

  const toggle = (value: Value) => {
    formField.clearError();
    onChange(values.includes(value)
      ? values.filter((selected) => selected !== value)
      : [...values, value]);
  };

  return (
    <View style={[styles.field, style]}>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled: effectiveDisabled, expanded: open }}
        disabled={effectiveDisabled}
        onPress={() => setOpen(true)}
        style={[
          styles.control,
          {
            direction,
            backgroundColor: effectiveDisabled ? theme.colors.surfaceMuted : theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            opacity: effectiveDisabled ? 0.55 : 1,
          },
        ]}>
        {leadingIcon ? <AppIcon color={theme.colors.primary} name={leadingIcon} size={21} /> : null}
        <View style={styles.valueArea}>
          <AppText color={error ? 'danger' : 'muted'} variant="caption" weight="600">
            {label}{required ? ' *' : ''}
          </AppText>
          <AppText
            color={selectedLabels.length > 0 ? 'default' : 'muted'}
            numberOfLines={2}
            variant="bodySmall">
            {valueLabel}
          </AppText>
        </View>
        {values.length > 0 ? (
          <View style={[styles.count, { backgroundColor: theme.colors.surfaceMuted }]}>
            <AppText color="primary" variant="caption" weight="800">
              {values.length}
            </AppText>
          </View>
        ) : null}
        <AppIcon color={theme.colors.textMuted} name="chevron-down" size={20} />
      </Pressable>

      {error || helperText ? (
        <AppFieldMessage error={Boolean(error)}>{error ?? helperText ?? ''}</AppFieldMessage>
      ) : null}

      <AppModal
        closeLabel={t('common.close')}
        onClose={() => setOpen(false)}
        title={label}
        visible={open}>
        <View style={styles.options}>
          {options.map((option) => {
            const selected = values.includes(option.value);
            return (
              <Pressable
                accessibilityLabel={option.label}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected, disabled: option.disabled }}
                disabled={option.disabled}
                key={String(option.value)}
                onPress={() => toggle(option.value)}
                style={[
                  styles.option,
                  {
                    direction,
                    backgroundColor: selected ? theme.colors.surfaceMuted : theme.colors.surface,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    borderRadius: theme.radius.sm,
                    opacity: option.disabled ? 0.5 : 1,
                  },
                ]}>
                {option.icon ? (
                  <AppIcon color={theme.colors.primary} name={option.icon} size={21} />
                ) : null}
                <View style={styles.optionText}>
                  <AppText variant="label">{option.label}</AppText>
                  {option.description ? (
                    <AppText color="muted" variant="caption">{option.description}</AppText>
                  ) : null}
                </View>
                <AppIcon
                  color={selected ? theme.colors.primary : theme.colors.textMuted}
                  name={selected ? 'checkbox' : 'square-outline'}
                  size={22}
                />
              </Pressable>
            );
          })}
        </View>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { width: '100%', gap: 4 },
  control: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  valueArea: { flex: 1, minWidth: 0, gap: 2 },
  count: {
    minWidth: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 6,
  },
  options: { gap: 8 },
  option: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  optionText: { flex: 1, minWidth: 0, gap: 2 },
});

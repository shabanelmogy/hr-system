import { useState } from 'react';
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppButton } from '@/src/shared/components/controls/AppButton';
import { AppIconButton } from '@/src/shared/components/controls/AppIconButton';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppModal } from '@/src/shared/components/surfaces/AppModal';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface AppFilterOption<Value extends string | number> {
  description?: string;
  disabled?: boolean;
  icon?: AppIconName;
  label: string;
  value: Value;
}

export interface AppFilterButtonProps<Value extends string | number> {
  applyLabel?: string;
  buttonLabel: string;
  buttonSize?: number;
  clearLabel?: string;
  description?: string;
  disabled?: boolean;
  icon?: AppIconName;
  modalTitle: string;
  onChange: (values: Value[]) => void;
  options: readonly AppFilterOption<Value>[];
  selectionMode?: 'multiple' | 'single';
  style?: StyleProp<ViewStyle>;
  values: readonly Value[];
}

export function AppFilterButton<Value extends string | number>({
  applyLabel,
  buttonLabel,
  buttonSize = 50,
  clearLabel,
  description,
  disabled = false,
  icon = 'filter-outline',
  modalTitle,
  onChange,
  options,
  selectionMode = 'multiple',
  style,
  values,
}: AppFilterButtonProps<Value>) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [draftValues, setDraftValues] = useState<Value[]>([...values]);

  const toggle = (value: Value) => {
    setDraftValues((current) => {
      if (selectionMode === 'single') return current.includes(value) ? [] : [value];
      return current.includes(value)
        ? current.filter((selected) => selected !== value)
        : [...current, value];
    });
  };

  const apply = () => {
    onChange(draftValues);
    setOpen(false);
  };

  const footer = (
    <View style={styles.footer}>
      <AppButton
        disabled={draftValues.length === 0}
        icon="close-circle-outline"
        onPress={() => setDraftValues([])}
        style={styles.footerButton}
        variant="outline">
        {clearLabel ?? t('common.clear')}
      </AppButton>
      <AppButton icon="checkmark-outline" onPress={apply} style={styles.footerButton}>
        {applyLabel ?? t('common.confirm')}
      </AppButton>
    </View>
  );

  return (
    <View style={[styles.container, { width: buttonSize + 2, height: buttonSize + 2 }, style]}>
      <AppIconButton
        color={values.length > 0 ? theme.colors.primary : theme.colors.text}
        disabled={disabled}
        icon={icon}
        label={buttonLabel}
        onPress={() => {
          setDraftValues([...values]);
          setOpen(true);
        }}
        size={24}
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.surface,
            borderColor: values.length > 0 ? theme.colors.primary : theme.colors.border,
            width: buttonSize,
            height: buttonSize,
          },
        ]}
      />

      {values.length > 0 ? (
        <View
          pointerEvents="none"
          style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <AppText style={{ color: theme.colors.onPrimary }} variant="caption" weight="800">
            {values.length}
          </AppText>
        </View>
      ) : null}

      <AppModal
        closeLabel={t('common.close')}
        footer={footer}
        icon={icon}
        onClose={() => setOpen(false)}
        subtitle={description}
        title={modalTitle}
        visible={open}>
        <View style={styles.options}>
          {options.map((option) => {
            const selected = draftValues.includes(option.value);
            return (
              <Pressable
                accessibilityLabel={option.label}
                accessibilityRole={selectionMode === 'single' ? 'radio' : 'checkbox'}
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
                  <AppIcon color={theme.colors.primary} name={option.icon} size={24} />
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
                  size={23}
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
  container: {
    position: 'relative',
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: { width: 50, height: 50, borderWidth: 1 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    paddingHorizontal: 5,
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
  footer: { flexDirection: 'row', gap: 10 },
  footerButton: { flex: 1 },
});

import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppFieldMessage } from '@/src/shared/components/forms/AppFieldMessage';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface SegmentedOption<Value extends string> {
  label: string;
  value: Value;
  disabled?: boolean;
  icon?: AppIconName;
}

export interface AppSegmentedControlProps<Value extends string> {
  label: string;
  options: readonly SegmentedOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  showLabel?: boolean;
  layout?: 'equal' | 'wrap';
  variant?: 'segment' | 'pill';
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export function AppSegmentedControl<Value extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  helperText,
  showLabel = false,
  layout = 'equal',
  variant = 'segment',
  style,
  containerStyle,
}: AppSegmentedControlProps<Value>) {
  const { theme } = useAppTheme();
  const { direction } = useLocalization();
  const supportingText = error ?? helperText;

  return (
    <View style={[styles.field, style]}>
      {showLabel ? (
        <AppText variant="label">
          {label}
          {required ? <AppText color="danger"> *</AppText> : null}
        </AppText>
      ) : null}
      <View
        accessibilityLabel={label}
        accessibilityRole="radiogroup"
        style={[
          styles.container,
          layout === 'wrap' && styles.wrappedContainer,
          {
            direction,
            backgroundColor: variant === 'segment' ? theme.colors.surfaceMuted : 'transparent',
            borderColor: error ? theme.colors.danger : 'transparent',
            borderRadius: variant === 'pill' ? theme.radius.full : theme.radius.md,
            opacity: disabled ? 0.55 : 1,
            padding: variant === 'segment' ? theme.spacing.xs : 0,
          },
          containerStyle,
        ]}>
        {options.map((option) => {
          const selected = option.value === value;
          const optionDisabled = disabled || option.disabled;

          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled: optionDisabled }}
              disabled={optionDisabled}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                layout === 'equal' ? styles.equalOption : styles.wrappedOption,
                {
                  backgroundColor: selected
                    ? variant === 'pill'
                      ? theme.colors.primary
                      : theme.colors.surface
                    : variant === 'pill'
                      ? theme.colors.surface
                      : 'transparent',
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  borderRadius: variant === 'pill' ? theme.radius.full : theme.radius.sm,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}>
              <View style={styles.optionContent}>
                {option.icon ? (
                  <AppIcon
                    color={selected && variant === 'pill'
                      ? theme.colors.onPrimary
                      : selected
                        ? theme.colors.primary
                        : theme.colors.textMuted}
                    name={option.icon}
                    size={17}
                  />
                ) : null}
                <AppText
                  align="center"
                  color={selected && variant === 'pill' ? 'inverse' : selected ? 'primary' : 'muted'}
                  variant="label">
                  {option.label}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
      {supportingText ? (
        <AppFieldMessage error={Boolean(error)}>
          {supportingText}
        </AppFieldMessage>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: 8,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1,
    gap: 4,
  },
  wrappedContainer: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  option: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  equalOption: {
    flex: 1,
  },
  wrappedOption: {
    flexGrow: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});

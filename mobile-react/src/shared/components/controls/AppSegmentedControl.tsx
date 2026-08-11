import { Pressable, StyleSheet, View } from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface SegmentedOption<Value extends string> {
  label: string;
  value: Value;
}

interface AppSegmentedControlProps<Value extends string> {
  label: string;
  options: readonly SegmentedOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
}

export function AppSegmentedControl<Value extends string>({
  label,
  options,
  value,
  onChange,
}: AppSegmentedControlProps<Value>) {
  const { theme } = useAppTheme();
  const { direction } = useLocalization();

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="radiogroup"
      style={[
        styles.container,
        {
          direction,
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.radius.md,
          padding: theme.spacing.xs,
        },
      ]}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: selected ? theme.colors.surface : 'transparent',
                borderColor: selected ? theme.colors.border : 'transparent',
                borderRadius: theme.radius.sm,
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            <AppText
              align="center"
              color={selected ? 'primary' : 'muted'}
              variant="label">
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
  },
  option: {
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
  },
});

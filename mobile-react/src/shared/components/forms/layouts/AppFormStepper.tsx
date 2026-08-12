import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface AppFormStep {
  id: string;
  label: string;
  content: ReactNode;
  description?: string;
  icon?: AppIconName;
  disabled?: boolean;
  completed?: boolean;
  hasError?: boolean;
  errorLabel?: string;
  optionalLabel?: string;
}

export interface AppFormStepperProps {
  label: string;
  steps: readonly AppFormStep[];
  activeStep: number;
  onStepChange?: (step: number) => void;
  keepMounted?: boolean;
  style?: StyleProp<ViewStyle>;
  panelStyle?: StyleProp<ViewStyle>;
}

export function AppFormStepper({
  label,
  steps,
  activeStep,
  onStepChange,
  keepMounted = true,
  style,
  panelStyle,
}: AppFormStepperProps) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const normalizedStep = Math.min(Math.max(activeStep, 0), Math.max(steps.length - 1, 0));

  return (
    <View style={[styles.root, style]}>
      <ScrollView
        accessibilityLabel={label}
        accessibilityRole="tablist"
        contentContainerStyle={[styles.stepList, { direction }]}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {steps.map((step, index) => {
          const active = index === normalizedStep;
          const completed = step.completed ?? index < normalizedStep;
          const color = step.hasError
            ? theme.colors.danger
            : completed
              ? theme.colors.success
              : active
                ? theme.colors.primary
                : theme.colors.textMuted;
          return (
            <View key={step.id} style={[styles.stepGroup, { direction }]}>
              <Pressable
                accessibilityLabel={step.hasError && step.errorLabel
                  ? `${step.label}. ${step.errorLabel}`
                  : step.optionalLabel
                    ? `${step.label}. ${step.optionalLabel}`
                    : step.label}
                accessibilityRole="tab"
                accessibilityState={{ disabled: step.disabled, selected: active }}
                disabled={step.disabled || !onStepChange}
                onPress={() => onStepChange?.(index)}
                style={({ pressed }) => [styles.step, { opacity: step.disabled ? 0.45 : pressed ? 0.72 : 1 }]}>
                <View
                  style={[
                    styles.stepIcon,
                    {
                      backgroundColor: active ? color : theme.colors.surface,
                      borderColor: color,
                      borderRadius: theme.radius.full,
                    },
                  ]}>
                  {completed ? (
                    <AppIcon color={active ? theme.colors.onPrimary : color} name="checkmark" size={18} />
                  ) : step.icon ? (
                    <AppIcon color={active ? theme.colors.onPrimary : color} name={step.icon} size={18} />
                  ) : (
                    <AppText
                      align="center"
                      style={{ color: active ? theme.colors.onPrimary : color }}
                      variant="label">
                      {index + 1}
                    </AppText>
                  )}
                </View>
                <AppText
                  align="center"
                  color={step.hasError ? 'danger' : active ? 'primary' : completed ? 'success' : 'muted'}
                  numberOfLines={2}
                  variant="caption">
                  {step.label}
                </AppText>
                {step.optionalLabel ? (
                  <AppText align="center" color="muted" numberOfLines={1} variant="caption">
                    {step.optionalLabel}
                  </AppText>
                ) : null}
              </Pressable>
              {index < steps.length - 1 ? (
                <View
                  accessibilityElementsHidden
                  style={[
                    styles.connector,
                    { backgroundColor: completed ? theme.colors.success : theme.colors.border },
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      {steps[normalizedStep]?.description ? (
        <AppText color="muted" variant="bodySmall">
          {steps[normalizedStep].description}
        </AppText>
      ) : null}

      <View style={[styles.panels, panelStyle]}>
        {steps.map((step, index) => {
          const selected = index === normalizedStep;
          if (!selected && !keepMounted) return null;
          return (
            <View
              accessibilityElementsHidden={!selected}
              importantForAccessibility={selected ? 'auto' : 'no-hide-descendants'}
              key={`${step.id}-panel`}
              style={!selected && styles.hiddenPanel}>
              {step.content}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: 16,
  },
  stepList: {
    minWidth: '100%',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  stepGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  step: {
    width: 104,
    alignItems: 'center',
    gap: 7,
  },
  stepIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  connector: {
    width: 28,
    height: 2,
    marginTop: 18,
  },
  panels: {
    width: '100%',
  },
  hiddenPanel: {
    display: 'none',
  },
});

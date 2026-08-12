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

export interface AppFormTab<Value extends string> {
  value: Value;
  label: string;
  content: ReactNode;
  icon?: AppIconName;
  disabled?: boolean;
  hasError?: boolean;
  errorLabel?: string;
}

export interface AppFormTabsProps<Value extends string> {
  label: string;
  tabs: readonly AppFormTab<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  keepMounted?: boolean;
  style?: StyleProp<ViewStyle>;
  panelStyle?: StyleProp<ViewStyle>;
}

export function AppFormTabs<Value extends string>({
  label,
  tabs,
  value,
  onChange,
  keepMounted = true,
  style,
  panelStyle,
}: AppFormTabsProps<Value>) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const activeTab = tabs.find((tab) => tab.value === value) ?? tabs[0];

  return (
    <View style={[styles.root, style]}>
      <ScrollView
        accessibilityLabel={label}
        accessibilityRole="tablist"
        contentContainerStyle={[
          styles.tabList,
          { direction, borderBottomColor: theme.colors.border },
        ]}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {tabs.map((tab) => {
          const selected = tab.value === activeTab?.value;
          return (
            <Pressable
              accessibilityLabel={tab.hasError && tab.errorLabel
                ? `${tab.label}. ${tab.errorLabel}`
                : tab.label}
              accessibilityRole="tab"
              accessibilityState={{ disabled: tab.disabled, selected }}
              disabled={tab.disabled}
              key={tab.value}
              onPress={() => onChange(tab.value)}
              style={({ pressed }) => [
                styles.tab,
                {
                  direction,
                  backgroundColor: selected ? theme.colors.surfaceMuted : 'transparent',
                  borderBottomColor: selected
                    ? theme.colors.primary
                    : tab.hasError
                      ? theme.colors.danger
                      : 'transparent',
                  opacity: tab.disabled ? 0.45 : pressed ? 0.72 : 1,
                },
              ]}>
              {tab.icon ? (
                <AppIcon
                  color={tab.hasError
                    ? theme.colors.danger
                    : selected
                      ? theme.colors.primary
                      : theme.colors.textMuted}
                  name={tab.icon}
                  size={18}
                />
              ) : null}
              <AppText color={tab.hasError ? 'danger' : selected ? 'primary' : 'muted'} variant="label">
                {tab.label}
              </AppText>
              {tab.hasError ? (
                <View
                  accessibilityElementsHidden
                  style={[styles.errorDot, { backgroundColor: theme.colors.danger }]}
                />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.panels, panelStyle]}>
        {tabs.map((tab) => {
          const selected = tab.value === activeTab?.value;
          if (!selected && !keepMounted) return null;
          return (
            <View
              accessibilityElementsHidden={!selected}
              importantForAccessibility={selected ? 'auto' : 'no-hide-descendants'}
              key={tab.value}
              style={!selected && styles.hiddenPanel}>
              {tab.content}
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
  tabList: {
    minWidth: '100%',
    borderBottomWidth: 1,
    gap: 4,
  },
  tab: {
    minWidth: 112,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderBottomWidth: 3,
    paddingHorizontal: 14,
  },
  errorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  panels: {
    width: '100%',
  },
  hiddenPanel: {
    display: 'none',
  },
});

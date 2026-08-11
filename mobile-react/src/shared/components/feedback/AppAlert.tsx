import type { PropsWithChildren } from 'react';
import { type StyleProp, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/src/core/theme';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppText, type AppTextColor } from '@/src/shared/components/typography/AppText';

export type AppAlertSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AppAlertProps extends Omit<ViewProps, 'style'> {
  severity?: AppAlertSeverity;
  title?: string;
  icon?: AppIconName;
  style?: StyleProp<ViewStyle>;
}

const severityIcon: Record<AppAlertSeverity, AppIconName> = {
  info: 'information-circle-outline',
  success: 'checkmark-circle-outline',
  warning: 'warning-outline',
  error: 'alert-circle-outline',
};

const severityTextColor: Record<AppAlertSeverity, AppTextColor> = {
  info: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'danger',
};

export function AppAlert({
  children,
  severity = 'info',
  title,
  icon,
  style,
  ...props
}: PropsWithChildren<AppAlertProps>) {
  const { theme } = useAppTheme();
  const color = severity === 'error'
    ? theme.colors.danger
    : severity === 'warning'
      ? theme.colors.warning
      : severity === 'success'
        ? theme.colors.success
        : theme.colors.primary;

  return (
    <View
      {...props}
      accessibilityLiveRegion={severity === 'error' ? 'assertive' : 'polite'}
      accessibilityRole={severity === 'error' ? 'alert' : undefined}
      style={[
        styles.alert,
        {
          backgroundColor: `${color}14`,
          borderColor: color,
          borderRadius: theme.radius.sm,
        },
        style,
      ]}>
      <AppIcon color={color} name={icon ?? severityIcon[severity]} size={20} />
      <View style={styles.content}>
        {title ? (
          <AppText color={severityTextColor[severity]} variant="label">
            {title}
          </AppText>
        ) : null}
        <AppText color={severityTextColor[severity]} variant="bodySmall">
          {children}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderStartWidth: 3,
    padding: 10,
  },
  content: {
    flex: 1,
    gap: 2,
  },
});

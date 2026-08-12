import type { PropsWithChildren, ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface AppFormSectionProps extends PropsWithChildren {
  title: string;
  description?: string;
  icon?: AppIconName;
  action?: ReactNode;
  divider?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function AppFormSection({
  children,
  title,
  description,
  icon,
  action,
  divider = true,
  style,
  contentStyle,
}: AppFormSectionProps) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel={title}
      style={[
        styles.section,
        divider && { borderBottomColor: theme.colors.border, borderBottomWidth: 1 },
        style,
      ]}>
      <View style={[styles.header, { direction }]}>
        {icon ? (
          <View
            style={[
              styles.icon,
              { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
            ]}>
            <AppIcon color={theme.colors.primary} name={icon} size={21} />
          </View>
        ) : null}
        <View style={styles.heading}>
          <AppText variant="label">{title}</AppText>
          {description ? (
            <AppText color="muted" variant="caption">
              {description}
            </AppText>
          ) : null}
        </View>
        {action}
      </View>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    gap: 14,
    paddingBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  content: {
    width: '100%',
    gap: 14,
  },
});

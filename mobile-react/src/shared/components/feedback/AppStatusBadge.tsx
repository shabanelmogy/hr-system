import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';

export interface AppStatusBadgeProps {
  label: string;
  color: string;
  icon?: AppIconName;
  variant?: 'soft' | 'outlined' | 'solid';
  style?: StyleProp<ViewStyle>;
}

export function AppStatusBadge({
  label,
  color,
  icon,
  variant = 'soft',
  style,
}: AppStatusBadgeProps) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const solid = variant === 'solid';

  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.badge,
        {
          direction,
          backgroundColor: solid ? color : variant === 'soft' ? `${color}1A` : 'transparent',
          borderColor: color,
        },
        style,
      ]}>
      {icon ? <AppIcon color={solid ? theme.colors.onSolid : color} name={icon} size={16} /> : null}
      <AppText style={{ color: solid ? theme.colors.onSolid : color }} variant="caption" weight="700">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
  },
});

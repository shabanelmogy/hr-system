import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface AppContextBadgeProps {
  label: string;
  value: string;
  icon: AppIconName;
  compact?: boolean;
  iconOnly?: boolean;
  loading?: boolean;
  disabled?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  error?: boolean;
  accent?: 'primary' | 'secondary' | 'accent' | 'warning' | 'success';
  tone?: 'surface' | 'onPrimary';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Domain-neutral identity/trigger for a global application context. Domain
 * owners keep responsibility for loading, authorization and switching.
 */
export function AppContextBadge({
  label,
  value,
  icon,
  compact = false,
  iconOnly = false,
  loading = false,
  disabled = false,
  expandable = false,
  expanded = false,
  error = false,
  accent = 'primary',
  tone = 'surface',
  onPress,
  style,
}: AppContextBadgeProps) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const interactive = Boolean(onPress) && !disabled && !loading;
  const onPrimary = tone === 'onPrimary';
  const accentColor = error ? theme.colors.danger : theme.colors[accent];
  const iconColor = onPrimary
    ? error
      ? theme.colors.onDanger
      : accent === 'secondary'
        ? theme.colors.onSecondary
        : accent === 'warning'
          ? theme.colors.onWarning
          : theme.colors.onSolid
    : accentColor;
  const textColor = onPrimary ? theme.colors.onPrimary : theme.colors.text;
  const accessibilityLabel = `${label}: ${value || label}`;
  const rootStyle: StyleProp<ViewStyle> = [
    styles.badge,
    compact ? styles.compactBadge : null,
    iconOnly ? styles.iconOnlyBadge : null,
    {
      direction,
      backgroundColor: onPrimary ? 'transparent' : theme.colors.surfaceMuted,
      borderColor: onPrimary ? 'transparent' : theme.colors.border,
      opacity: disabled && !loading ? 0.58 : 1,
    },
    style,
  ];
  const content = (
    <>
      <View
        style={[
          styles.iconSurface,
          { backgroundColor: onPrimary ? accentColor : theme.colors.surface },
        ]}>
        {loading ? (
          <ActivityIndicator color={iconColor} size="small" />
        ) : (
          <AppIcon color={iconColor} name={icon} size={16} />
        )}
      </View>
      {!iconOnly ? (
        <View style={styles.copy}>
          <AppText
            numberOfLines={1}
            style={[styles.contextValue, { color: textColor }]}
            variant="caption"
            weight="800">
            {value || label}
          </AppText>
        </View>
      ) : null}
      {expandable && !iconOnly ? (
        <AppIcon
          color={onPrimary ? theme.colors.onPrimary : theme.colors.textMuted}
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
        />
      ) : null}
    </>
  );

  if (interactive) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: false, expanded: expandable ? expanded : undefined }}
        hitSlop={4}
        onPress={onPress}
        style={({ pressed }) => [rootStyle, pressed ? styles.pressed : null]}>
        {content}
      </Pressable>
    );
  }

  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="text" style={rootStyle}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 96,
    maxWidth: 164,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
  },
  compactBadge: {
    minWidth: 72,
    maxWidth: 116,
  },
  iconOnlyBadge: {
    width: 44,
    minWidth: 44,
    maxWidth: 44,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  iconSurface: {
    width: 24,
    height: 24,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  contextValue: {
    fontSize: 12.5,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.68,
  },
});

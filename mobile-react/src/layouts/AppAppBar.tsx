import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useAuth, useLogout } from '@/src/features/auth';
import { AppIcon, AppIconButton, AppText } from '@/src/shared/components';

export interface AppAppBarProps {
  notificationCount?: number;
  onNotificationsPress?: () => void;
  showDrawer?: boolean;
  showLogout?: boolean;
  showNotifications?: boolean;
  onDrawerPress?: () => void;
}

export function AppAppBar({
  notificationCount = 0,
  onNotificationsPress,
  showDrawer = false,
  showLogout = false,
  showNotifications = false,
  onDrawerPress,
}: AppAppBarProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const { isLoggingOut, logout } = useLogout();
  const { width } = useWindowDimensions();
  const compactAuthenticatedBar = width < 520 && (showDrawer || showLogout);
  const developmentRoleLabel =
    __DEV__ && session?.roles.length ? session.roles.join(', ') : null;

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.primary }}>
      <View
        accessibilityRole="header"
        style={[
          styles.appBar,
          {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.text,
          },
        ]}>
        <View style={[styles.toolbar, { direction }]}>
          <View style={[styles.brand, { direction }]}>
            {showDrawer ? (
              <AppIconButton
                color={theme.colors.onPrimary}
                icon="menu-outline"
                label={t('navigation.openMenu')}
                onPress={onDrawerPress}
                pressedBackgroundColor="transparent"
                style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
              />
            ) : null}
            <AppIcon color={theme.colors.onPrimary} name="people-outline" size={26} />
            {!compactAuthenticatedBar ? (
              <AppText style={{ color: theme.colors.onPrimary }} variant="label" weight="800">
                {t('common.appName')}
              </AppText>
            ) : null}
            {developmentRoleLabel ? (
              <View
                accessibilityLabel={`Development role: ${developmentRoleLabel}`}
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor: theme.colors.onPrimaryMuted,
                    borderColor: theme.colors.onPrimary,
                  },
                ]}>
                <AppText
                  numberOfLines={1}
                  style={{ color: theme.colors.onPrimary }}
                  variant="caption"
                  weight="800">
                  DEV · {developmentRoleLabel}
                </AppText>
              </View>
            ) : null}
          </View>

          <View style={[styles.actions, { direction }]}>
            {showNotifications && onNotificationsPress ? (
              <View style={styles.notificationAction}>
                <AppIconButton
                  color={theme.colors.onPrimary}
                  icon={notificationCount > 0 ? 'notifications' : 'notifications-outline'}
                  label={notificationCount > 0
                    ? `${t('navigation.notifications')}: ${t('notifications.unreadCount', { count: notificationCount })}`
                    : t('navigation.notifications')}
                  onPress={onNotificationsPress}
                  pressedBackgroundColor="transparent"
                  style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
                />
                {notificationCount > 0 ? (
                  <View
                    pointerEvents="none"
                    style={[
                      styles.notificationBadge,
                      {
                        backgroundColor: theme.colors.danger,
                        borderColor: theme.colors.primary,
                      },
                    ]}>
                    <AppText
                      style={[styles.notificationBadgeText, { color: theme.colors.onDanger }]}
                      weight="800">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </AppText>
                  </View>
                ) : null}
              </View>
            ) : null}
            {showLogout ? (
              <AppIconButton
                color={theme.colors.onPrimary}
                disabled={isLoggingOut}
                icon={isLoggingOut ? 'hourglass-outline' : 'log-out-outline'}
                label={t('auth.logout')}
                onPress={() => void logout()}
                pressedBackgroundColor="transparent"
                style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
              />
            ) : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar: {
    width: '100%',
    minHeight: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  toolbar: {
    width: '100%',
    maxWidth: 1040,
    minHeight: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  notificationAction: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 9,
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    fontSize: 9,
    lineHeight: 11,
  },
  roleBadge: {
    maxWidth: 132,
    minHeight: 26,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
  },
});

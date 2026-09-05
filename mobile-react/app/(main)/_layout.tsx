import { DrawerActions } from 'expo-router/react-navigation';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';

import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { canAccessRoute, MAIN_DRAWER_ROUTES, useAuth } from '@/src/features/auth';
import { useUnreadNotificationCount } from '@/src/features/notifications';
import { TenantAccessProvider } from '@/src/features/tenant-access';
import { AppDrawerContent } from '@/src/layouts/drawer';
import { MainLayout } from '@/src/layouts/main/MainLayout';
import { AppNavigationHeader } from '@/src/layouts/navigation/AppNavigationHeader';
import { AppIcon } from '@/src/shared/components';

export default function ProtectedRouteLayout() {
  const { t } = useTranslation();
  const { isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const canViewNotifications = canAccessRoute(ROUTES.notifications, session);
  const unreadNotifications = useUnreadNotificationCount(canViewNotifications).data ?? 0;
  const notificationLabel = unreadNotifications > 0
    ? `${t('navigation.notifications')} (${unreadNotifications > 99 ? '99+' : unreadNotifications})`
    : t('navigation.notifications');

  return (
    <TenantAccessProvider>
      <MainLayout>
        <Drawer
          drawerContent={(props) => <AppDrawerContent {...props} />}
          screenOptions={({ navigation }) => ({
            drawerPosition: isRTL ? 'right' : 'left',
            drawerType: 'front',
            drawerStyle: {
              width: 286,
              backgroundColor: theme.colors.surface,
            },
            drawerActiveTintColor: theme.colors.primary,
            drawerInactiveTintColor: theme.colors.textMuted,
            drawerActiveBackgroundColor: theme.colors.surfaceMuted,
            drawerLabelStyle: {
              fontSize: 14,
              fontWeight: '600',
              letterSpacing: 0,
            },
            header: () => (
              <AppNavigationHeader
                notificationCount={unreadNotifications}
                onDrawerPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                onNotificationsPress={() => router.push(asHref(ROUTES.notifications))}
                showDrawer
                showLogout
                showNotifications={canViewNotifications}
              />
            ),
            sceneStyle: {
              backgroundColor: theme.colors.background,
            },
          })}>
          {MAIN_DRAWER_ROUTES.map((definition) => {
            const accessible = canAccessRoute(definition.path, session);
            const title = definition.name === 'notifications'
              ? notificationLabel
              : t(definition.titleKey);

            return (
              <Drawer.Screen
                key={definition.name}
                name={definition.name}
                options={{
                  drawerItemStyle: accessible ? undefined : { display: 'none' },
                  headerShown: definition.headerShown,
                  title,
                  drawerIcon: ({ color, size }) => (
                    <AppIcon color={color} name={definition.icon} size={size} />
                  ),
                }}
              />
            );
          })}
          <Drawer.Screen
            name="modal"
            options={{
              drawerItemStyle: { display: 'none' },
              title: t('modal.title'),
            }}
          />
        </Drawer>
      </MainLayout>
    </TenantAccessProvider>
  );
}

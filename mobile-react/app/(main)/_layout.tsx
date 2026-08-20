import { DrawerActions } from '@react-navigation/native';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';

import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useCanAccessRoute } from '@/src/features/auth';
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
  const canViewBasicData = useCanAccessRoute(ROUTES.basicData.root);
  const canViewExtras = useCanAccessRoute(ROUTES.extras.root);
  const canViewAdvancedTools = useCanAccessRoute(ROUTES.advancedTools.root);
  const canViewSuperAdminDashboard = useCanAccessRoute(ROUTES.superAdminDashboard);
  const canManageTenants = useCanAccessRoute(ROUTES.tenantManagement);
  const canManageTenantAdmins = useCanAccessRoute(ROUTES.tenantAdminManagement);
  const canViewAdministration = useCanAccessRoute(ROUTES.administration.root);
  const canViewNotifications = useCanAccessRoute(ROUTES.notifications);
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
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: t('navigation.home'),
            drawerIcon: ({ color, size }) => (
              <AppIcon color={color} name="home-outline" size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: t('navigation.profile'),
            drawerIcon: ({ color, size }) => (
              <AppIcon color={color} name="person-circle-outline" size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="notifications"
          options={{
            drawerItemStyle: canViewNotifications ? undefined : { display: 'none' },
            title: notificationLabel,
            drawerIcon: ({ color, size }) => (
              <AppIcon color={color} name="notifications-outline" size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="basic-data"
          options={{
            drawerItemStyle: canViewBasicData ? undefined : { display: 'none' },
            headerShown: false,
            title: t('navigation.basicData'),
            drawerIcon: ({ color, size }) => (
              <AppIcon color={color} name="server-outline" size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="administration"
          options={{
            drawerItemStyle: canViewAdministration ? undefined : { display: 'none' },
            headerShown: false,
            title: t('navigation.administration'),
            drawerIcon: ({ color, size }) => (
              <AppIcon color={color} name="people-outline" size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="extras"
          options={{
            drawerItemStyle: canViewExtras ? undefined : { display: 'none' },
            headerShown: false,
            title: t('navigation.extras'),
            drawerIcon: ({ color, size }) => (
              <AppIcon color={color} name="apps-outline" size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="advanced-tools"
          options={{
            drawerItemStyle: canViewAdvancedTools ? undefined : { display: 'none' },
            headerShown: false,
            title: t('navigation.advancedTools'),
            drawerIcon: ({ color, size }) => (
              <AppIcon color={color} name="construct-outline" size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="super-admin-dashboard"
          options={{
            drawerItemStyle: canViewSuperAdminDashboard ? undefined : { display: 'none' },
            title: t('navigation.superAdminDashboard'),
            drawerIcon: ({ color, size }) => (
              <AppIcon color={color} name="speedometer-outline" size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="tenant-management"
          options={{
            drawerItemStyle: canManageTenants ? undefined : { display: 'none' },
            title: t('navigation.tenantManagement'),
            drawerIcon: ({ color, size }) => (
              <AppIcon color={color} name="business-outline" size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="tenant-admin-management"
          options={{
            drawerItemStyle: canManageTenantAdmins ? undefined : { display: 'none' },
            title: t('navigation.tenantAdminManagement'),
            drawerIcon: ({ color, size }) => (
              <AppIcon color={color} name="shield-checkmark-outline" size={size} />
            ),
          }}
        />
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

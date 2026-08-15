import { DrawerActions } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useCanAccessRoute } from '@/src/features/auth';
import { TenantAccessProvider } from '@/src/features/tenant-access';
import { AppAppBar } from '@/src/layouts/AppAppBar';
import { AppDrawerContent } from '@/src/layouts/drawer';
import { MainLayout } from '@/src/layouts/main/MainLayout';
import { AppIcon } from '@/src/shared/components';

export default function ProtectedRouteLayout() {
  const { t } = useTranslation();
  const { isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const canViewBasicData = useCanAccessRoute(ROUTES.basicData.root);
  const canViewSuperAdminDashboard = useCanAccessRoute(ROUTES.superAdminDashboard);
  const canManageTenants = useCanAccessRoute(ROUTES.tenantManagement);
  const canManageTenantAdmins = useCanAccessRoute(ROUTES.tenantAdminManagement);
  const canViewAdministration = useCanAccessRoute(ROUTES.administration.root);

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
            <AppAppBar
              onDrawerPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              showDrawer
              showLogout
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

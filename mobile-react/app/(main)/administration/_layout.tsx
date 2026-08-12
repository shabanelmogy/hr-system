import { DrawerActions } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { permissions, useAuthorization } from '@/src/features/auth';
import { AppAppBar } from '@/src/layouts/AppAppBar';
import { AppIcon } from '@/src/shared/components';
import { useAppTheme } from '@/src/core/theme';

const viewUsersPermission = [permissions.ViewUsers] as const;
const viewRolesPermission = [permissions.ViewRoles] as const;

export default function AdministrationLayout() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { allowed: canViewUsers } = useAuthorization({
    requiredPermissions: viewUsersPermission,
  });
  const { allowed: canViewRoles } = useAuthorization({
    requiredPermissions: viewRolesPermission,
  });
  const bottomSpacing = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={({ navigation }) => ({
        header: () => (
          <AppAppBar
            onDrawerPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            showDrawer
            showLogout
          />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 56 + bottomSpacing,
          paddingTop: 6,
          paddingBottom: bottomSpacing,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0,
        },
        sceneStyle: { backgroundColor: theme.colors.background },
      })}>
      <Tabs.Screen
        name="index"
        options={{
          href: canViewUsers ? undefined : null,
          title: t('navigation.users'),
          tabBarIcon: ({ color, size }) => (
            <AppIcon color={color} name="people-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="roles"
        options={{
          href: canViewRoles ? undefined : null,
          title: t('navigation.roles'),
          tabBarIcon: ({ color, size }) => (
            <AppIcon color={color} name="shield-checkmark-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="role-permissions/[id]"
        options={{
          href: null,
          title: t('roleManagement.managePermissions'),
        }}
      />
    </Tabs>
  );
}

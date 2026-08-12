import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/src/core/constants/routes';
import { useAppTheme } from '@/src/core/theme';
import { useCanAccessRoute } from '@/src/features/auth';
import { AppIcon } from '@/src/shared/components';

export default function TabLayout() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const canViewSettings = useCanAccessRoute(ROUTES.settings);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          minHeight: 62,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, size }) => (
            <AppIcon color={color} name="home-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: canViewSettings ? undefined : null,
          title: t('navigation.settings'),
          tabBarIcon: ({ color, size }) => (
            <AppIcon color={color} name="settings-outline" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

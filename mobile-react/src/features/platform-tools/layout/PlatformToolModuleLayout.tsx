import { DrawerActions } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { canAccessRoute, useAuth } from '@/src/features/auth';
import {
  PLATFORM_TOOL_MODULES,
  type PlatformToolModuleId,
} from '@/src/features/platform-tools/constants/platform-tool-definitions';
import { ModuleDrawerContent } from '@/src/layouts/module/ModuleDrawerContent';
import { AppNavigationHeader } from '@/src/layouts/navigation/AppNavigationHeader';
import { AppIcon } from '@/src/shared/components';

export function PlatformToolModuleLayout({ moduleId }: { moduleId: PlatformToolModuleId }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const moduleDefinition = PLATFORM_TOOL_MODULES[moduleId];
  const permanentDrawer = width >= 960;

  return (
    <Drawer
      drawerContent={(props) => (
        <ModuleDrawerContent
          {...props}
          description={t(moduleDefinition.descriptionKey)}
          icon={moduleDefinition.icon}
          title={t(moduleDefinition.titleKey)}
        />
      )}
      screenOptions={({ navigation }) => ({
        drawerPosition: isRTL ? 'right' : 'left',
        drawerType: permanentDrawer ? 'permanent' : 'front',
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
            onDrawerPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            showDrawer={!permanentDrawer}
            showLogout
          />
        ),
        sceneStyle: { backgroundColor: theme.colors.background },
      })}>
      <Drawer.Screen
        name="index"
        options={{
          title: t('navigation.overview'),
          drawerIcon: ({ color, size }) => (
            <AppIcon color={color} name="grid-outline" size={size} />
          ),
        }}
      />
      {moduleDefinition.tools.map((tool) => (
        <Drawer.Screen
          key={tool.id}
          name={tool.screen}
          options={{
            drawerItemStyle: canAccessRoute(tool.route, session)
              ? undefined
              : { display: 'none' },
            title: t(tool.titleKey),
            drawerIcon: ({ color, size }) => (
              <AppIcon color={color} name={tool.icon} size={size} />
            ),
          }}
        />
      ))}
    </Drawer>
  );
}

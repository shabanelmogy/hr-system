import { DrawerActions } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useCanAccessRoute } from '@/src/features/auth';
import { BASIC_DATA_SCREENS } from '@/src/features/basic-data/constants/basic-data-screens';
import { AppAppBar } from '@/src/layouts/AppAppBar';
import { ModuleDrawerContent } from '@/src/layouts/module/ModuleDrawerContent';
import { AppIcon } from '@/src/shared/components';

export function BasicDataLayout() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const permanentDrawer = width >= 960;
  const canViewOverview = useCanAccessRoute(ROUTES.basicData.root);
  const canViewGeographicalInformation = useCanAccessRoute(
    ROUTES.basicData.geographicalInformation,
  );
  const canViewOrganizationalStructure = useCanAccessRoute(
    ROUTES.basicData.organizationalStructure,
  );

  return (
    <Drawer
      drawerContent={(props) => (
        <ModuleDrawerContent
          {...props}
          description={t('basicData.description')}
          icon="server-outline"
          title={t('basicData.title')}
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
          <AppAppBar
            onDrawerPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            showDrawer={!permanentDrawer}
            showLogout
          />
        ),
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
      })}>
      <Drawer.Screen
        name={BASIC_DATA_SCREENS.overview}
        options={{
          drawerItemStyle: canViewOverview ? undefined : { display: 'none' },
          title: t('navigation.overview'),
          drawerIcon: ({ color, size }) => (
            <AppIcon color={color} name="grid-outline" size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name={BASIC_DATA_SCREENS.geographicalInformation}
        options={{
          drawerItemStyle: canViewGeographicalInformation ? undefined : { display: 'none' },
          title: t('navigation.geographicalInformation'),
          drawerIcon: ({ color, size }) => (
            <AppIcon color={color} name="earth-outline" size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name={BASIC_DATA_SCREENS.organizationalStructure}
        options={{
          drawerItemStyle: canViewOrganizationalStructure ? undefined : { display: 'none' },
          title: t('navigation.organizationalStructure'),
          drawerIcon: ({ color, size }) => (
            <AppIcon color={color} name="business-outline" size={size} />
          ),
        }}
      />
    </Drawer>
  );
}

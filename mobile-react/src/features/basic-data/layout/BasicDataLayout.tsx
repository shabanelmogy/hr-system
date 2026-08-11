import { Drawer } from 'expo-router/drawer';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { BASIC_DATA_SCREENS } from '@/src/features/basic-data/constants/basic-data-screens';
import { ModuleDrawerContent } from '@/src/layouts/module/ModuleDrawerContent';
import { AppIcon } from '@/src/shared/components';

export function BasicDataLayout() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const permanentDrawer = width >= 960;

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
      screenOptions={{
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
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
      }}>
      <Drawer.Screen
        name={BASIC_DATA_SCREENS.overview}
        options={{
          title: t('navigation.overview'),
          drawerIcon: ({ color, size }) => (
            <AppIcon color={color} name="grid-outline" size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name={BASIC_DATA_SCREENS.geographicalInformation}
        options={{
          title: t('navigation.geographicalInformation'),
          drawerIcon: ({ color, size }) => (
            <AppIcon color={color} name="earth-outline" size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name={BASIC_DATA_SCREENS.organizationalStructure}
        options={{
          title: t('navigation.organizationalStructure'),
          drawerIcon: ({ color, size }) => (
            <AppIcon color={color} name="business-outline" size={size} />
          ),
        }}
      />
    </Drawer>
  );
}

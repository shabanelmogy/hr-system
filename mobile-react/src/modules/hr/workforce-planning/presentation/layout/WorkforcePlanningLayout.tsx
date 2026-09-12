import { DrawerActions } from 'expo-router/react-navigation';
import { Drawer } from 'expo-router/drawer';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useCanAccessRoute } from '@/src/platform/auth';
import { AppNavigationHeader, ModuleDrawerContent } from '@/src/platform/navigation';
import { AppIcon } from '@/src/shared/components';

export function WorkforcePlanningLayout() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const permanentDrawer = width >= 960;
  const access = {
    overview: useCanAccessRoute(ROUTES.workforcePlanning.index),
    plans: useCanAccessRoute(ROUTES.workforcePlanning.plans),
    budgets: useCanAccessRoute(ROUTES.workforcePlanning.budgets),
    envelopes: useCanAccessRoute(ROUTES.workforcePlanning.positionEnvelopes),
    requests: useCanAccessRoute(ROUTES.workforcePlanning.staffingRequests),
    amendments: useCanAccessRoute(ROUTES.workforcePlanning.envelopeAmendments),
    trace: useCanAccessRoute(ROUTES.workforcePlanning.trace),
  };

  return (
    <Drawer
      drawerContent={(props) => <ModuleDrawerContent {...props} description={t('workforcePlanning.description')} icon="briefcase-outline" title={t('workforcePlanning.title')} />}
      screenOptions={({ navigation }) => ({
        drawerPosition: isRTL ? 'right' : 'left',
        drawerType: permanentDrawer ? 'permanent' : 'front',
        drawerStyle: { width: 286, backgroundColor: theme.colors.surface },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textMuted,
        drawerActiveBackgroundColor: theme.colors.surfaceMuted,
        drawerLabelStyle: { fontSize: 14, fontWeight: '600', letterSpacing: 0 },
        header: () => <AppNavigationHeader onDrawerPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} showDrawer={!permanentDrawer} showLogout />,
        sceneStyle: { backgroundColor: theme.colors.background },
      })}>
      <Drawer.Screen name="index" options={{ drawerItemStyle: access.overview ? undefined : { display: 'none' }, title: t('navigation.overview'), drawerIcon: ({ color, size }) => <AppIcon color={color} name="grid-outline" size={size} /> }} />
      <Drawer.Screen name="plans" options={{ drawerItemStyle: access.plans ? undefined : { display: 'none' }, title: t('workforcePlanning.plans'), drawerIcon: ({ color, size }) => <AppIcon color={color} name="document-text-outline" size={size} /> }} />
      <Drawer.Screen name="budgets" options={{ drawerItemStyle: access.budgets ? undefined : { display: 'none' }, title: t('workforcePlanning.budgets'), drawerIcon: ({ color, size }) => <AppIcon color={color} name="cash-outline" size={size} /> }} />
      <Drawer.Screen name="position-envelopes" options={{ drawerItemStyle: access.envelopes ? undefined : { display: 'none' }, title: t('workforcePlanning.authorizedPositionCapacity'), drawerIcon: ({ color, size }) => <AppIcon color={color} name="cube-outline" size={size} /> }} />
      <Drawer.Screen name="staffing-requests" options={{ drawerItemStyle: access.requests ? undefined : { display: 'none' }, title: t('workforcePlanning.staffingRequests'), drawerIcon: ({ color, size }) => <AppIcon color={color} name="people-outline" size={size} /> }} />
      <Drawer.Screen name="envelope-amendments" options={{ drawerItemStyle: access.amendments ? undefined : { display: 'none' }, title: t('workforcePlanning.capacityAmendments'), drawerIcon: ({ color, size }) => <AppIcon color={color} name="add-circle-outline" size={size} /> }} />
      <Drawer.Screen name="trace" options={{ drawerItemStyle: access.trace ? undefined : { display: 'none' }, title: t('workforcePlanning.planningTraceCommitments'), drawerIcon: ({ color, size }) => <AppIcon color={color} name="git-branch-outline" size={size} /> }} />
    </Drawer>
  );
}

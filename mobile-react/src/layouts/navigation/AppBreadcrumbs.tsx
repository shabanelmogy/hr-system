import { usePathname, useRouter } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { asHref, ROUTES, type AppRoute } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, AppText } from '@/src/shared/components';

interface BreadcrumbItem {
  key: string;
  labelKey: string;
  route?: AppRoute;
}

const homeItem: BreadcrumbItem = {
  key: 'home',
  labelKey: 'navigation.home',
  route: ROUTES.home,
};

const basicDataItem: BreadcrumbItem = {
  key: 'basic-data',
  labelKey: 'navigation.basicData',
  route: ROUTES.basicData.root,
};

const extrasItem: BreadcrumbItem = {
  key: 'extras',
  labelKey: 'navigation.extras',
  route: ROUTES.extras.root,
};

const advancedToolsItem: BreadcrumbItem = {
  key: 'advanced-tools',
  labelKey: 'navigation.advancedTools',
  route: ROUTES.advancedTools.root,
};

const administrationItem: BreadcrumbItem = {
  key: 'administration',
  labelKey: 'navigation.administration',
  route: ROUTES.administration.root,
};

const breadcrumbsByPath: Record<string, readonly BreadcrumbItem[]> = {
  [ROUTES.home]: [homeItem],
  [ROUTES.settings]: [
    homeItem,
    { key: 'settings', labelKey: 'navigation.settings' },
  ],
  [ROUTES.profile]: [
    homeItem,
    { key: 'profile', labelKey: 'navigation.profile' },
  ],
  [ROUTES.notifications]: [
    homeItem,
    { key: 'notifications', labelKey: 'navigation.notifications' },
  ],
  [ROUTES.superAdminDashboard]: [
    homeItem,
    { key: 'super-admin-dashboard', labelKey: 'navigation.superAdminDashboard' },
  ],
  [ROUTES.tenantManagement]: [
    homeItem,
    { key: 'tenant-management', labelKey: 'navigation.tenantManagement' },
  ],
  [ROUTES.tenantAdminManagement]: [
    homeItem,
    { key: 'tenant-admin-management', labelKey: 'navigation.tenantAdminManagement' },
  ],
  [ROUTES.modal]: [
    homeItem,
    { key: 'modal', labelKey: 'modal.title' },
  ],
  [ROUTES.basicData.root]: [homeItem, basicDataItem],
  [ROUTES.basicData.geographicalInformation]: [
    homeItem,
    basicDataItem,
    { key: 'geographical-information', labelKey: 'navigation.geographicalInformation' },
  ],
  [ROUTES.basicData.organizationalStructure]: [
    homeItem,
    basicDataItem,
    { key: 'organizational-structure', labelKey: 'navigation.organizationalStructure' },
  ],
  [ROUTES.extras.root]: [homeItem, extrasItem],
  [ROUTES.extras.files]: [
    homeItem,
    extrasItem,
    { key: 'files', labelKey: 'navigation.files' },
  ],
  [ROUTES.extras.appointments]: [
    homeItem,
    extrasItem,
    { key: 'appointments', labelKey: 'navigation.appointments' },
  ],
  [ROUTES.advancedTools.root]: [homeItem, advancedToolsItem],
  [ROUTES.advancedTools.trackChanges]: [
    homeItem,
    advancedToolsItem,
    { key: 'track-changes', labelKey: 'navigation.trackChanges' },
  ],
  [ROUTES.advancedTools.localizationApi]: [
    homeItem,
    advancedToolsItem,
    { key: 'localization-api', labelKey: 'navigation.localizationApi' },
  ],
  [ROUTES.advancedTools.healthCheck]: [
    homeItem,
    advancedToolsItem,
    { key: 'health-check', labelKey: 'navigation.healthCheck' },
  ],
  [ROUTES.advancedTools.apiEndpoints]: [
    homeItem,
    advancedToolsItem,
    { key: 'api-endpoints', labelKey: 'navigation.apiEndpoints' },
  ],
  [ROUTES.advancedTools.hangfireDashboard]: [
    homeItem,
    advancedToolsItem,
    { key: 'hangfire-dashboard', labelKey: 'navigation.hangfireDashboard' },
  ],
  [ROUTES.administration.root]: [homeItem, administrationItem],
  [ROUTES.administration.invitations]: [
    homeItem,
    administrationItem,
    { key: 'invitations', labelKey: 'navigation.invitations' },
  ],
  [ROUTES.administration.roles]: [
    homeItem,
    administrationItem,
    { key: 'roles', labelKey: 'navigation.roles' },
  ],
};

function getBreadcrumbs(pathname: string): readonly BreadcrumbItem[] | undefined {
  const normalizedPath =
    pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const exactBreadcrumbs = breadcrumbsByPath[normalizedPath];

  if (exactBreadcrumbs) {
    return exactBreadcrumbs;
  }

  if (normalizedPath.startsWith(`${ROUTES.administration.rolePermissionsRoot}/`)) {
    return [
      homeItem,
      administrationItem,
      {
        key: 'roles',
        labelKey: 'navigation.roles',
        route: ROUTES.administration.roles,
      },
      { key: 'role-permissions', labelKey: 'roleManagement.managePermissions' },
    ];
  }

  return undefined;
}

export function AppBreadcrumbs() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const breadcrumbs = getBreadcrumbs(pathname);

  if (!breadcrumbs) {
    return null;
  }

  return (
    <View
      accessibilityLabel={t('navigation.breadcrumbs')}
      accessibilityRole="header"
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
      ]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { direction }]}
        horizontal
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        showsHorizontalScrollIndicator={false}>
        {breadcrumbs.map((item, index) => {
          const isCurrent = index === breadcrumbs.length - 1;
          const targetRoute = item.route;

          return (
            <View key={item.key} style={[styles.item, { direction }]}>
              {index > 0 ? (
                <AppIcon
                  color={theme.colors.textMuted}
                  name={isRTL ? 'chevron-back' : 'chevron-forward'}
                  size={14}
                />
              ) : null}
              {isCurrent || !targetRoute ? (
                <AppText
                  color={isCurrent ? 'default' : 'muted'}
                  numberOfLines={1}
                  variant="caption"
                  weight={isCurrent ? '700' : '500'}>
                  {t(item.labelKey)}
                </AppText>
              ) : (
                <Pressable
                  accessibilityRole="link"
                  hitSlop={8}
                  onPress={() => router.navigate(asHref(targetRoute))}
                  style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
                  <AppText color="primary" numberOfLines={1} variant="caption" weight="600">
                    {t(item.labelKey)}
                  </AppText>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 38,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  content: {
    minWidth: '100%',
    minHeight: 38,
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginEnd: 6,
  },
  link: {
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.55,
  },
});

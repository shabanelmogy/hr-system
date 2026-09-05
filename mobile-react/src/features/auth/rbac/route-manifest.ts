import { ROUTES, type AppRoute } from '@/src/core/constants/routes';
import type { AppIconName } from '@/src/shared/components/icons/AppIcon';
import type { AuthorizationRequirement } from './authorization';
import { permissions, type PermissionString } from './permissions';
import { appRoles } from './roles';

export interface RoutePolicy {
  path: AppRoute;
  roles?: readonly string[];
  permissions?: readonly PermissionString[];
  anyOf?: readonly AuthorizationRequirement[];
}

export interface MainDrawerRouteDefinition {
  name:
    | '(tabs)'
    | 'profile'
    | 'notifications'
    | 'basic-data'
    | 'administration'
    | 'extras'
    | 'advanced-tools'
    | 'super-admin-dashboard'
    | 'tenant-management'
    | 'tenant-admin-management'
    | 'recruitment'
    | 'finance';
  path: AppRoute;
  titleKey: string;
  icon: AppIconName;
  headerShown?: boolean;
}

export const BASIC_DATA_VIEW_PERMISSIONS = [
  permissions.ViewAddressTypes,
  permissions.ViewCompanyGeographicScope,
  permissions.ViewOrganizationalStructure,
] as const;

/**
 * Canonical access manifest. More-specific routes must precede their parents.
 * Route adapters and navigation both consume these paths through canAccessRoute.
 */
export const routePolicies: readonly RoutePolicy[] = [
  { path: ROUTES.superAdminDashboard, roles: [appRoles.superAdmin] },
  { path: ROUTES.tenantManagement, roles: [appRoles.superAdmin] },
  { path: ROUTES.tenantAdminManagement, roles: [appRoles.superAdmin] },
  { path: ROUTES.administration.rolePermissionsRoot, permissions: [permissions.ViewRoles] },
  { path: ROUTES.administration.roles, permissions: [permissions.ViewRoles] },
  { path: ROUTES.administration.invitations, permissions: [permissions.ViewUsers] },
  {
    path: ROUTES.administration.root,
    anyOf: [
      { permissions: [permissions.ViewUsers] },
      { permissions: [permissions.ViewRoles] },
    ],
  },
  // Countries, States, and Districts are platform-managed reference data.
  // Tenant administrators select their operating countries through the separate
  // company geographic-scope workflow; they never manage this catalog directly.
  { path: ROUTES.basicData.countries, roles: [appRoles.superAdmin] },
  { path: ROUTES.basicData.states, roles: [appRoles.superAdmin] },
  { path: ROUTES.basicData.districts, roles: [appRoles.superAdmin] },
  { path: ROUTES.basicData.addressTypes, permissions: [permissions.ViewAddressTypes] },
  {
    path: ROUTES.basicData.companyGeographicScope,
    permissions: [permissions.ViewCompanyGeographicScope],
  },
  {
    path: ROUTES.basicData.organizationalStructureManagement,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  ...[
    ROUTES.basicData.organizationalStructureBranches,
    ROUTES.basicData.organizationalStructureDepartments,
    ROUTES.basicData.organizationalStructureDivisions,
    ROUTES.basicData.organizationalStructureJobTitles,
    ROUTES.basicData.organizationalStructureJobLevels,
    ROUTES.basicData.organizationalStructurePositions,
    ROUTES.basicData.organizationalStructureJobDescriptions,
    ROUTES.basicData.organizationalStructureCostCenters,
    ROUTES.basicData.organizationalStructureCurrencies,
  ].map((path) => ({ path, permissions: [permissions.ViewOrganizationalStructure] as const })),
  {
    path: ROUTES.basicData.geographicalInformation,
    anyOf: [
      { roles: [appRoles.superAdmin] },
      { permissions: [permissions.ViewAddressTypes] },
    ],
  },
  {
    path: ROUTES.basicData.organizationalStructure,
    anyOf: [
      { permissions: [permissions.ViewCompanyGeographicScope] },
      { permissions: [permissions.ViewOrganizationalStructure] },
    ],
  },
  {
    path: ROUTES.basicData.root,
    anyOf: [
      { permissions: BASIC_DATA_VIEW_PERMISSIONS },
      { roles: [appRoles.superAdmin] },
    ],
  },
  { path: ROUTES.extras.files, roles: [appRoles.admin] },
  { path: ROUTES.extras.appointments, permissions: [permissions.ViewUsers] },
  {
    path: ROUTES.extras.root,
    anyOf: [
      { roles: [appRoles.admin] },
      { permissions: [permissions.ViewUsers] },
    ],
  },
  { path: ROUTES.advancedTools.trackChanges, permissions: [permissions.ViewChangeLogs] },
  { path: ROUTES.advancedTools.localizationApi, permissions: [permissions.ViewLocalizations] },
  { path: ROUTES.advancedTools.healthCheck, roles: [appRoles.admin] },
  { path: ROUTES.advancedTools.apiEndpoints, roles: [appRoles.admin] },
  {
    path: ROUTES.advancedTools.hangfireDashboard,
    permissions: [permissions.ViewHangfireDashboard],
  },
  {
    path: ROUTES.advancedTools.root,
    anyOf: [
      { permissions: [permissions.ViewChangeLogs] },
      { permissions: [permissions.ViewLocalizations] },
      { roles: [appRoles.admin] },
      { permissions: [permissions.ViewHangfireDashboard] },
    ],
  },
  { path: ROUTES.recruitment.root, permissions: [permissions.ViewRecruitment] },
  { path: ROUTES.finance.fiscalYears, permissions: [permissions.ViewFiscalYears] },
  { path: ROUTES.finance.root, permissions: [permissions.ViewFiscalYears] },
  { path: ROUTES.profile },
  { path: ROUTES.notifications, roles: [appRoles.admin, appRoles.user] },
  { path: ROUTES.home },
  { path: ROUTES.settings, roles: [appRoles.admin, appRoles.superAdmin] },
  { path: ROUTES.modal },
];

export const superAdminAllowedRoutes: readonly AppRoute[] = [
  ROUTES.home,
  ROUTES.profile,
  ROUTES.settings,
  ROUTES.superAdminDashboard,
  ROUTES.tenantManagement,
  ROUTES.tenantAdminManagement,
  ROUTES.basicData.root,
  ROUTES.basicData.geographicalInformation,
  ROUTES.basicData.countries,
  ROUTES.basicData.states,
  ROUTES.basicData.districts,
];

export const MAIN_DRAWER_ROUTES: readonly MainDrawerRouteDefinition[] = [
  {
    name: '(tabs)',
    path: ROUTES.home,
    titleKey: 'navigation.home',
    icon: 'home-outline',
  },
  {
    name: 'profile',
    path: ROUTES.profile,
    titleKey: 'navigation.profile',
    icon: 'person-circle-outline',
  },
  {
    name: 'notifications',
    path: ROUTES.notifications,
    titleKey: 'navigation.notifications',
    icon: 'notifications-outline',
  },
  {
    name: 'basic-data',
    path: ROUTES.basicData.root,
    titleKey: 'navigation.basicData',
    icon: 'server-outline',
    headerShown: false,
  },
  {
    name: 'administration',
    path: ROUTES.administration.root,
    titleKey: 'navigation.administration',
    icon: 'people-outline',
    headerShown: false,
  },
  {
    name: 'extras',
    path: ROUTES.extras.root,
    titleKey: 'navigation.extras',
    icon: 'apps-outline',
    headerShown: false,
  },
  {
    name: 'advanced-tools',
    path: ROUTES.advancedTools.root,
    titleKey: 'navigation.advancedTools',
    icon: 'construct-outline',
    headerShown: false,
  },
  {
    name: 'recruitment',
    path: ROUTES.recruitment.root,
    titleKey: 'navigation.recruitment',
    icon: 'briefcase-outline',
    headerShown: false,
  },
  {
    name: 'finance',
    path: ROUTES.finance.fiscalYears,
    titleKey: 'navigation.finance',
    icon: 'calendar-outline',
    headerShown: false,
  },

  {
    name: 'super-admin-dashboard',
    path: ROUTES.superAdminDashboard,
    titleKey: 'navigation.superAdminDashboard',
    icon: 'speedometer-outline',
  },
  {
    name: 'tenant-management',
    path: ROUTES.tenantManagement,
    titleKey: 'navigation.tenantManagement',
    icon: 'business-outline',
  },
  {
    name: 'tenant-admin-management',
    path: ROUTES.tenantAdminManagement,
    titleKey: 'navigation.tenantAdminManagement',
    icon: 'shield-checkmark-outline',
  },
];

import type { Href } from 'expo-router';

export const ROUTES = {
  home: '/',
  onboarding: '/onboarding',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  confirmEmail: '/confirm-email',
  acceptInvitation: '/accept-invitation',
  resendConfirmation: '/resend-confirmation',
  profile: '/profile',
  notifications: '/notifications',
  settings: '/settings',
  superAdminDashboard: '/super-admin-dashboard',
  tenantManagement: '/tenant-management',
  tenantAdminManagement: '/tenant-admin-management',
  modal: '/modal',
  basicData: {
    root: '/basic-data',
    geographicalInformation: '/basic-data/geographical-information',
    countries: '/basic-data/geographical-information/countries',
    states: '/basic-data/geographical-information/states',
    districts: '/basic-data/geographical-information/districts',
    addressTypes: '/basic-data/geographical-information/address-types',
    organizationalStructure: '/basic-data/organizational-structure',
    organizationalStructureManagement: '/basic-data/organizational-structure/manage',
    organizationalStructureBranches: '/basic-data/organizational-structure/branches',
    organizationalStructureDepartments: '/basic-data/organizational-structure/departments',
    organizationalStructureDivisions: '/basic-data/organizational-structure/divisions',
    organizationalStructureJobTitles: '/basic-data/organizational-structure/job-titles',
    organizationalStructureJobLevels: '/basic-data/organizational-structure/job-levels',
    organizationalStructurePositions: '/basic-data/organizational-structure/positions',
    organizationalStructureJobDescriptions: '/basic-data/organizational-structure/job-descriptions',
    organizationalStructureCostCenters: '/basic-data/organizational-structure/cost-centers',
    organizationalStructureCurrencies: '/basic-data/organizational-structure/currencies',
    companyGeographicScope: '/basic-data/organizational-structure/geographic-scope',
  },
  extras: {
    root: '/extras',
    files: '/extras/files',
    appointments: '/extras/appointments',
  },
  advancedTools: {
    root: '/advanced-tools',
    trackChanges: '/advanced-tools/track-changes',
    localizationApi: '/advanced-tools/localization-api',
    healthCheck: '/advanced-tools/health-check',
    apiEndpoints: '/advanced-tools/api-endpoints',
    hangfireDashboard: '/advanced-tools/hangfire-dashboard',
  },
  administration: {
    root: '/administration',
    invitations: '/administration/invitations',
    roles: '/administration/roles',
    rolePermissionsRoot: '/administration/role-permissions',
    rolePermissions: (roleId: string) =>
      `/administration/role-permissions/${encodeURIComponent(roleId)}` as
        `/administration/role-permissions/${string}`,
  },
  recruitment: {
    root: '/recruitment',
  },
  finance: {
    root: '/finance',
    fiscalYears: '/finance/fiscal-years',
  },
} as const;

export type AppRoute =
  | typeof ROUTES.home
  | typeof ROUTES.onboarding
  | typeof ROUTES.login
  | typeof ROUTES.register
  | typeof ROUTES.forgotPassword
  | typeof ROUTES.resetPassword
  | typeof ROUTES.confirmEmail
  | typeof ROUTES.acceptInvitation
  | typeof ROUTES.resendConfirmation
  | typeof ROUTES.profile
  | typeof ROUTES.notifications
  | typeof ROUTES.settings
  | typeof ROUTES.superAdminDashboard
  | typeof ROUTES.tenantManagement
  | typeof ROUTES.tenantAdminManagement
  | typeof ROUTES.modal
  | (typeof ROUTES.basicData)[keyof typeof ROUTES.basicData]
  | (typeof ROUTES.extras)[keyof typeof ROUTES.extras]
  | (typeof ROUTES.advancedTools)[keyof typeof ROUTES.advancedTools]
  | typeof ROUTES.administration.root
  | typeof ROUTES.administration.invitations
  | typeof ROUTES.administration.roles
  | typeof ROUTES.administration.rolePermissionsRoot
  | ReturnType<typeof ROUTES.administration.rolePermissions>
  | typeof ROUTES.recruitment.root
  | (typeof ROUTES.finance)[keyof typeof ROUTES.finance];

// Expo regenerates typed route declarations after route files change.
export const asHref = (route: AppRoute): Href => route as Href;

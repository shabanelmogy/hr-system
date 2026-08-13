import type { Href } from 'expo-router';

export const ROUTES = {
  home: '/',
  onboarding: '/onboarding',
  login: '/login',
  register: '/register',
  settings: '/settings',
  superAdminDashboard: '/super-admin-dashboard',
  tenantManagement: '/tenant-management',
  modal: '/modal',
  basicData: {
    root: '/basic-data',
    geographicalInformation: '/basic-data/geographical-information',
    organizationalStructure: '/basic-data/organizational-structure',
  },
  administration: {
    root: '/administration',
    roles: '/administration/roles',
    rolePermissionsRoot: '/administration/role-permissions',
    rolePermissions: (roleId: string) =>
      `/administration/role-permissions/${encodeURIComponent(roleId)}` as
        `/administration/role-permissions/${string}`,
  },
} as const;

export type AppRoute =
  | typeof ROUTES.home
  | typeof ROUTES.onboarding
  | typeof ROUTES.login
  | typeof ROUTES.register
  | typeof ROUTES.settings
  | typeof ROUTES.superAdminDashboard
  | typeof ROUTES.tenantManagement
  | typeof ROUTES.modal
  | (typeof ROUTES.basicData)[keyof typeof ROUTES.basicData]
  | typeof ROUTES.administration.root
  | typeof ROUTES.administration.roles
  | typeof ROUTES.administration.rolePermissionsRoot
  | ReturnType<typeof ROUTES.administration.rolePermissions>;

// Expo regenerates typed route declarations after route files change.
export const asHref = (route: AppRoute): Href => route as Href;

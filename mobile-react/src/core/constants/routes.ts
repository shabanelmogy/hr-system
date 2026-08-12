import type { Href } from 'expo-router';

export const ROUTES = {
  home: '/',
  login: '/login',
  settings: '/settings',
  superAdminDashboard: '/super-admin-dashboard',
  tenantManagement: '/tenant-management',
  modal: '/modal',
  basicData: {
    root: '/basic-data',
    geographicalInformation: '/basic-data/geographical-information',
    organizationalStructure: '/basic-data/organizational-structure',
  },
} as const;

export type AppRoute =
  | typeof ROUTES.home
  | typeof ROUTES.login
  | typeof ROUTES.settings
  | typeof ROUTES.superAdminDashboard
  | typeof ROUTES.tenantManagement
  | typeof ROUTES.modal
  | (typeof ROUTES.basicData)[keyof typeof ROUTES.basicData];

// Expo regenerates typed route declarations after route files change.
export const asHref = (route: AppRoute): Href => route as Href;

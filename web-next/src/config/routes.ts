// Application route definitions with TypeScript support.
import type { Route } from "next";

export type AppPath = Route;

const toAppPath = (path: string): AppPath => path as AppPath;

export const normalizeAppPath = (path: string): AppPath =>
  toAppPath(`/${path.replace(/^\/+/, "")}`);

export interface ExtrasRoutes {
  filesManager: AppPath;
  mediaViewer: (id: string, fileExtension: string, storedFileName: string, fileName: string) => AppPath;
  appointments: AppPath;
}

export interface AdvancedToolsRoutes {
  trackChanges: AppPath;
  healthCheck: AppPath;
  apiEndpoints: AppPath;
  localizationApi: AppPath;
  hangfireDashboard: AppPath;
}

export interface BasicDataRoutes {
  index: AppPath;
  countries: AppPath;
  addressTypes: AppPath;
  states: AppPath;
  districts: AppPath;
  countryReport: AppPath;
  globalPresence: AppPath;
  companyGeographicScope: AppPath;
}

export interface AuthRoutes {
  rolesPage: AppPath;
  usersPage: AppPath;
  invitationsPage: AppPath;
  rolePermissionsPage: (id: string) => AppPath;
  crystalReportsPage: AppPath;
}

export interface SuperAdminRoutes {
  dashboard: AppPath;
  tenants: AppPath;
  tenantAdmins: AppPath;
  geography: {
    countries: AppPath;
    states: AppPath;
    districts: AppPath;
  };
}

export interface AppRoutes {
  login: "/login";
  register: "/register";
  resendEmailConfirmation: "/resend-email-confirmation";
  emailConfirmed: "/confirm-email";
  forgetPassword: "/forget-password";
  resetPassword: "/reset-password";
  acceptInvitation: "/accept-invitation";
  changePassword: "/change-password";
  home: "/";
  profile: "/profile";
  extras: ExtrasRoutes;
  advancedTools: AdvancedToolsRoutes;
  basicData: BasicDataRoutes;
  auth: AuthRoutes;
  superAdmin: SuperAdminRoutes;
  kpis: AppPath;
  trends: AppPath;
  healthPipeline: AppPath;
  attendanceTrends: AppPath;
  attendanceDevices: {
    index: AppPath;
    users: AppPath;
    punches: AppPath;
    pullRuns: AppPath;
  };
}

export const appRoutes: AppRoutes = {
  login: "/login",
  register: "/register",
  resendEmailConfirmation: "/resend-email-confirmation",
  emailConfirmed: "/confirm-email",
  forgetPassword: "/forget-password",
  resetPassword: "/reset-password",
  acceptInvitation: "/accept-invitation",
  changePassword: "/change-password",
  home: "/",
  profile: "/profile",

  extras: {
    filesManager: "/files",
    mediaViewer: (id, fileExtension, storedFileName, fileName) =>
      toAppPath(`/files/view/${id}/${fileExtension}/${storedFileName}/${fileName}`),
    appointments: "/appointments",
  },

  advancedTools: {
    trackChanges: "/advanced-tools/track-changes",
    healthCheck: "/advanced-tools/health-check",
    apiEndpoints: "/advanced-tools/api-endpoints",
    localizationApi: "/advanced-tools/localization-api",
    hangfireDashboard: "/advanced-tools/hangfire-dashboard",
  },

  basicData: {
    index: toAppPath("/basic-data"),
    countries: "/basic-data/countries",
    addressTypes: "/basic-data/address-types",
    states: "/basic-data/states",
    districts: "/basic-data/districts",
    countryReport: "/basic-data/country-report",
    globalPresence: "/basic-data/global-presence",
    companyGeographicScope: toAppPath("/basic-data/organizational-structure/geographic-scope"),
  },

  auth: {
    rolesPage: "/administration/roles",
    usersPage: "/administration/users",
    invitationsPage: toAppPath("/administration/invitations"),
    rolePermissionsPage: (id) =>
      toAppPath(`/administration/manage-role-permissions/${id}`),
    // Cast while Next's generated typed-route declarations catch up to this new App Router page.
    crystalReportsPage: toAppPath("/administration/crystal-reports"),
  },

  superAdmin: {
    dashboard: "/super-admin",
    tenants: "/super-admin/tenants",
    tenantAdmins: "/super-admin/tenant-admins",
    geography: {
      countries: toAppPath("/super-admin/geography/countries"),
      states: toAppPath("/super-admin/geography/states"),
      districts: toAppPath("/super-admin/geography/districts"),
    },
  },

  kpis: "/kpis",
  trends: "/trends",
  healthPipeline: "/health-pipeline",
  attendanceTrends: "/attendance-trends",
  attendanceDevices: {
    index: toAppPath("/attendance-devices"),
    users: toAppPath("/attendance-devices/users"),
    punches: toAppPath("/attendance-devices/punches"),
    pullRuns: toAppPath("/attendance-devices/pull-runs"),
  },
} as const;

export type RouteKey = keyof AppRoutes;
export type RouteValue = AppRoutes[RouteKey];

export default appRoutes;

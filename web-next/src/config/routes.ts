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
  countries: AppPath;
  addressTypes: AppPath;
  states: AppPath;
  districts: AppPath;
  countryReport: AppPath;
  globalPresence: AppPath;
}

export interface AuthRoutes {
  rolesPage: AppPath;
  usersPage: AppPath;
  rolePermissionsPage: (id: string) => AppPath;
}

export interface AppRoutes {
  login: "/login";
  register: "/register";
  resendEmailConfirmation: "/resend-email-confirmation";
  emailConfirmed: "/email-confirmation";
  forgetPassword: "/forget-password";
  resetPassword: "/reset-password";
  changePassword: "/change-password";
  home: "/";
  profile: "/profile";
  extras: ExtrasRoutes;
  advancedTools: AdvancedToolsRoutes;
  basicData: BasicDataRoutes;
  auth: AuthRoutes;
  kpis: AppPath;
  trends: AppPath;
  healthPipeline: AppPath;
  attendanceTrends: AppPath;
}

export const appRoutes: AppRoutes = {
  login: "/login",
  register: "/register",
  resendEmailConfirmation: "/resend-email-confirmation",
  emailConfirmed: "/email-confirmation",
  forgetPassword: "/forget-password",
  resetPassword: "/reset-password",
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
    countries: "/basic-data/countries",
    addressTypes: "/basic-data/address-types",
    states: "/basic-data/states",
    districts: "/basic-data/districts",
    countryReport: "/basic-data/country-report",
    globalPresence: "/basic-data/global-presence",
  },

  auth: {
    rolesPage: "/administration/roles",
    usersPage: "/administration/users",
    rolePermissionsPage: (id) =>
      toAppPath(`/administration/manage-role-permissions/${id}`),
  },

  kpis: "/kpis",
  trends: "/trends",
  healthPipeline: "/health-pipeline",
  attendanceTrends: "/attendance-trends",
} as const;

export type RouteKey = keyof AppRoutes;
export type RouteValue = AppRoutes[RouteKey];

export default appRoutes;
